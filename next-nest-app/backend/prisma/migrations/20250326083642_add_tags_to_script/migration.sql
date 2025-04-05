-- AlterTable
ALTER TABLE "Script" ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
