const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: { transactions: true }
  });

  for (const user of users) {
    const depositSum = user.transactions
      .filter(t => t.type === 'DEPOSIT' && t.status === 'APPROVED')
      .reduce((sum, t) => sum + t.amount, 0);
    const withdrawalSum = user.transactions
      .filter(t => t.type === 'WITHDRAWAL' && t.status === 'APPROVED')
      .reduce((sum, t) => sum + t.amount, 0);
    const profitSum = user.transactions
      .filter(t => t.type === 'PROFIT_POSTING' && t.status === 'APPROVED')
      .reduce((sum, t) => sum + t.amount, 0);
    const lossSum = user.transactions
      .filter(t => t.type === 'LOSS_POSTING' && t.status === 'APPROVED')
      .reduce((sum, t) => sum + t.amount, 0);
    const penaltySum = user.transactions
      .filter(t => t.type === 'PENALTY' && t.status === 'APPROVED')
      .reduce((sum, t) => sum + t.amount, 0);

    const actualBalance = depositSum - withdrawalSum + profitSum - lossSum - penaltySum;
    
    console.log(`User: ${user.name} (${user.role})`);
    console.log(`  -> Current DB Balance: ${user.balance}`);
    console.log(`  -> Calculated Balance: ${actualBalance}`);
    
    if (user.balance !== actualBalance) {
      console.log(`  -> Fixing balance to ${actualBalance}`);
      await prisma.user.update({
        where: { id: user.id },
        data: { balance: actualBalance }
      });
    }
  }
}
main().finally(() => prisma.$disconnect());
