/*
  Warnings:

  - You are about to drop the column `activeModel` on the `AIConfig` table. All the data in the column will be lost.
  - You are about to drop the column `embedding` on the `KnowledgeBase` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "AIProvider" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "providerType" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "modelName" TEXT NOT NULL DEFAULT 'gpt-4o',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "config" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AIConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "activeProviderId" TEXT,
    "systemPrompt" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_AIConfig" ("createdAt", "id", "systemPrompt", "updatedAt") SELECT "createdAt", "id", "systemPrompt", "updatedAt" FROM "AIConfig";
DROP TABLE "AIConfig";
ALTER TABLE "new_AIConfig" RENAME TO "AIConfig";
CREATE TABLE "new_KnowledgeBase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "contentType" TEXT NOT NULL DEFAULT 'txt',
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_KnowledgeBase" ("content", "createdAt", "filename", "id") SELECT "content", "createdAt", "filename", "id" FROM "KnowledgeBase";
DROP TABLE "KnowledgeBase";
ALTER TABLE "new_KnowledgeBase" RENAME TO "KnowledgeBase";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
