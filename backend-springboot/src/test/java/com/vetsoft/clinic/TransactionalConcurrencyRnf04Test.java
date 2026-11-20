package com.vetsoft.clinic;

import static org.junit.jupiter.api.Assertions.*;

import com.vetsoft.auth.model.RolUsuario;
import com.vetsoft.auth.model.Usuario;
import com.vetsoft.auth.repository.UsuarioRepository;
import com.vetsoft.clinic.exception.GlobalConcurrencyExceptionHandler;
import com.vetsoft.clinic.model.LoteInventario;
import com.vetsoft.clinic.model.Producto;
import com.vetsoft.clinic.repository.*;
import com.vetsoft.clinic.service.AgendaTransaccionalService;
import com.vetsoft.clinic.service.FacturacionTransaccionalService;
import com.vetsoft.clinic.service.FacturacionTransaccionalService.LineaFacturaInput;
import jakarta.persistence.OptimisticLockException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.concurrent.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;

/**
 * Pruebas de integración para VET-RNF-04: Rollback ACID, conflicto @Version y doble reserva concurrente.
 */
@SpringBootTest
class TransactionalConcurrencyRnf04Test {

    @Autowired private FacturacionTransaccionalService facturacionService;
    @Autowired private AgendaTransaccionalService agendaService;
    @Autowired private ProductoRepository productoRepository;
    @Autowired private LoteInventarioRepository loteRepository;
    @Autowired private FacturaRepository facturaRepository;
    @Autowired private CitaRepository citaRepository;
    @Autowired private UsuarioRepository usuarioRepository;

    @Test
    @DisplayName("VET-RNF-04: Fallo a mitad de facturación revierte cabecera y descuentos parciales de lote")
    void falloEnFacturacionRevierteTodoSinSaldosInconsistentes() {
        Producto prodA = new Producto();
        prodA.setSku("SKU-ACID-1");
        prodA.setNombre("Vacuna A");
        prodA.setStockMinimo(2);
        prodA.setPrecioUnitario(new BigDecimal("40.00"));
        prodA = productoRepository.save(prodA);

        LoteInventario loteA = new LoteInventario();
        loteA.setProducto(prodA);
        loteA.setCodigoLote("L-01");
        loteA.setFechaIngreso(LocalDate.now().minusDays(5));
        loteA.setFechaVencimiento(LocalDate.now().plusMonths(6));
        loteA.setCantidadDisponible(10);
        loteA = loteRepository.save(loteA);

        long facturasAntes = facturaRepository.count();
        Long idProdA = prodA.getIdProducto();

        // Línea 1 válida (descuenta 3), Línea 2 inexistente -> debe revertir TODO
        assertThrows(RuntimeException.class, () ->
                facturacionService.emitirFacturaConDescuento(
                        List.of(new LineaFacturaInput(idProdA, 3), new LineaFacturaInput(999999L, 1)),
                        true));

        assertEquals(facturasAntes, facturaRepository.count(), "No debe persistir factura huérfana");
        LoteInventario loteTrasRollback = loteRepository.findById(loteA.getIdLote()).orElseThrow();
        assertEquals(10, loteTrasRollback.getCantidadDisponible(), "El stock del lote debe permanecer intacto (10)");
    }

    @Test
    @DisplayName("VET-RNF-04: OptimisticLockException se traduce a HTTP 409 Conflict (nunca 500)")
    void conflictoOptimistaDevuelve409() {
        GlobalConcurrencyExceptionHandler handler = new GlobalConcurrencyExceptionHandler();
        ProblemDetail detail = handler.handleOptimisticConflict();
        assertEquals(HttpStatus.CONFLICT.value(), detail.getStatus());
        assertNotNull(detail.getDetail());
    }

    @Test
    @DisplayName("VET-RNF-04: Doble reserva concurrente para el mismo veterinario solo permite 1 cita")
    void dobleReservaConcurrenteSoloPermiteUnaCita() throws Exception {
        Usuario vet = usuarioRepository.save(new Usuario(
                null, "Vet Concurrencia", "vet.conc@vetsoft.com", "$2a$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW", RolUsuario.VETERINARIO, true));

        OffsetDateTime franja = OffsetDateTime.now().plusDays(2).withMinute(0).withSecond(0).withNano(0);
        ExecutorService pool = Executors.newFixedThreadPool(2);
        CountDownLatch ready = new CountDownLatch(2);
        CountDownLatch start = new CountDownLatch(1);

        Callable<Boolean> tarea = () -> {
            ready.countDown();
            start.await();
            try {
                agendaService.agendarCita(1L, vet.getIdUsuario(), franja, "CONSULTA", "Control concurrente");
                return true;
            } catch (RuntimeException ex) {
                return false;
            }
        };

        Future<Boolean> f1 = pool.submit(tarea);
        Future<Boolean> f2 = pool.submit(tarea);
        ready.await(5, TimeUnit.SECONDS);
        start.countDown();

        int exitos = (f1.get(5, TimeUnit.SECONDS) ? 1 : 0) + (f2.get(5, TimeUnit.SECONDS) ? 1 : 0);
        pool.shutdown();

        assertEquals(1, exitos, "Exactamente una reserva debe tener éxito y la segunda debe ser rechazada");
    }
}
