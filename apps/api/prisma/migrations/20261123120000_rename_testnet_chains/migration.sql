-- 'ethereum' and 'base' meant Sepolia and Base Sepolia. Give the testnets explicit
-- names so 'ethereum' and 'base' can mean mainnet.
UPDATE "Wallet" SET "chain" = 'sepolia' WHERE "chain" = 'ethereum';
UPDATE "Wallet" SET "chain" = 'base-sepolia' WHERE "chain" = 'base';
