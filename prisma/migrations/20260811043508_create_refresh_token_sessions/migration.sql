-- CreateTable
CREATE TABLE "RefreshTokenSession" (
    "id" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "replacedByTokenId" TEXT,
    "deviceInfo" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RefreshTokenSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RefreshTokenSession_tokenId_key" ON "RefreshTokenSession"("tokenId");

-- CreateIndex
CREATE INDEX "RefreshTokenSession_userId_idx" ON "RefreshTokenSession"("userId");

-- CreateIndex
CREATE INDEX "RefreshTokenSession_expiresAt_idx" ON "RefreshTokenSession"("expiresAt");

-- CreateIndex
CREATE INDEX "RefreshTokenSession_revokedAt_idx" ON "RefreshTokenSession"("revokedAt");

-- AddForeignKey
ALTER TABLE "RefreshTokenSession" ADD CONSTRAINT "RefreshTokenSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
