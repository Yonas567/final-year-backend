-- CreateTable
CREATE TABLE "sensor_samples" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,
    "z" DOUBLE PRECISION NOT NULL,
    "magnitude" DOUBLE PRECISION,
    "pga" DOUBLE PRECISION,
    "label" INTEGER,

    CONSTRAINT "sensor_samples_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "earthquake_events" (
    "id" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,
    "magnitude" DOUBLE PRECISION NOT NULL,
    "level" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "depth" TEXT NOT NULL,
    "lat" TEXT NOT NULL,
    "lon" TEXT NOT NULL,

    CONSTRAINT "earthquake_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prediction_runs" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "probability" DOUBLE PRECISION NOT NULL,
    "magnitude" DOUBLE PRECISION NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "region" TEXT NOT NULL,
    "coords" TEXT NOT NULL,
    "risk" TEXT NOT NULL,
    "features" JSONB,

    CONSTRAINT "prediction_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stations" (
    "id" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lon" DOUBLE PRECISION NOT NULL,
    "region" TEXT,
    "city" TEXT,
    "zone" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "pga" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "stations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sensor_samples_deviceId_timestamp_idx" ON "sensor_samples"("deviceId", "timestamp");

-- CreateIndex
CREATE INDEX "earthquake_events_time_idx" ON "earthquake_events"("time" DESC);

-- CreateIndex
CREATE INDEX "prediction_runs_timestamp_idx" ON "prediction_runs"("timestamp" DESC);
