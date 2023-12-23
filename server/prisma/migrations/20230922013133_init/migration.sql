-- CreateTable
CREATE TABLE "Docs" (
    "documentId" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Docs_pkey" PRIMARY KEY ("documentId")
);
