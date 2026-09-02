# Checklist final para exposición

## Funcional

- [ ] Inicia simulación
- [ ] Reloj avanza
- [ ] Cambia Día 1 -> Día 5
- [ ] Vehículos se desplazan
- [ ] Vehículos siguen rutas
- [ ] Pedidos aparecen en el mapa
- [ ] Pedidos cambian de estado
- [ ] Entregas actualizan métricas
- [ ] Semáforo cambia según tiempo simulado
- [ ] Bloqueo aparece
- [ ] Ruta se replantea
- [ ] Vehículo continúa después de replanificación
- [ ] Avería aparece
- [ ] Pedido se reasigna
- [ ] Simulación termina
- [ ] Aparecen resultados finales

## Alcance

- [ ] No backend
- [ ] No API
- [ ] No BD
- [ ] No Java
- [ ] No algoritmo real
- [ ] No login
- [ ] No CRUD innecesario
- [ ] No controles de aceleración
- [ ] No avanzar/retroceder

## Guion esperado de validación

1. Entrar a la pestaña Simulación 5D.
2. Revisar que el estado inicial muestre configuración y mapa operativo sin rutas activas.
3. Presionar `Iniciar simulación`.
4. Verificar que el reloj y el timeline avancen.
5. Confirmar que auto, moto y bicicleta se muevan por rutas ortogonales.
6. Observar entregas reales y actualización de métricas.
7. Esperar el hito de Día 2: bloqueo, pedido crítico y replanificación.
8. Confirmar que AUTO-03 continúe por ruta alternativa.
9. Esperar el hito de Día 3: incremento de demanda sin incidencia crítica.
10. Esperar el hito de Día 4: avería de MOTO-02 y reasignación de PED-078 a AUTO-04.
11. Confirmar que Fleet muestre MOTO-02 averiado y Orders muestre PED-078 reasignado.
12. Finalizar o esperar el cierre de Día 5.
13. Confirmar resultados finales:
    - Pedidos procesados: `1,248`
    - Entregados: `1,248`
    - Incumplidos: `0`
    - Incidencias: `2`
    - Replanificaciones: `2`
    - Tiempo real: `00:43:12`
    - Resultado: `Todos los pedidos dentro del plazo`

## Riesgos a revisar antes de exponer

- [ ] Que el navegador no tenga zoom extraño.
- [ ] Que la pantalla tenga suficiente ancho para ver mapa y panel derecho.
- [ ] Que el servidor local esté activo.
- [ ] Que no haya dos instancias de Vite usando puertos distintos sin querer.
- [ ] Que el expositor no prometa backend, API, base de datos o algoritmo real.
