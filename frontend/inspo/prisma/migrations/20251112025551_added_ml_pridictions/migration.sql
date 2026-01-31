-- CreateTable
CREATE TABLE "MLPrediction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "predictionType" TEXT NOT NULL,
    "inputX" JSONB NOT NULL,
    "inputY" JSONB NOT NULL,
    "featureNames" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "normalizationMethod" TEXT,
    "featureSelectionMethod" TEXT,
    "testSize" DOUBLE PRECISION,
    "cvFolds" INTEGER,
    "includeRidge" BOOLEAN,
    "includeLasso" BOOLEAN,
    "maxFeatures" INTEGER,
    "results" JSONB NOT NULL,
    "bestModel" TEXT NOT NULL,
    "bestModelScore" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MLPrediction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MLPrediction_userId_createdAt_idx" ON "MLPrediction"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "MLPrediction_userId_predictionType_idx" ON "MLPrediction"("userId", "predictionType");

-- AddForeignKey
ALTER TABLE "MLPrediction" ADD CONSTRAINT "MLPrediction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
