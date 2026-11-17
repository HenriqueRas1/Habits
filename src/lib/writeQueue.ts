/**
 * Fila única para gravações que dependem umas das outras (hábito → registros → timer).
 * Mutations com o mesmo scope rodam em ordem: marcar o check logo depois de criar o hábito
 * nunca chega ao banco antes do próprio hábito (o registro aponta para ele).
 */
export const WRITE_QUEUE = { id: 'writes' } as const
