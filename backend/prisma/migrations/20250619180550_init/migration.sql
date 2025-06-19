-- CreateTable
CREATE TABLE "Trace" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "task" TEXT NOT NULL,
    "context" JSONB NOT NULL,
    "model_output" TEXT NOT NULL,
    "metadata" JSONB NOT NULL,

    CONSTRAINT "Trace_pkey" PRIMARY KEY ("id")
);
