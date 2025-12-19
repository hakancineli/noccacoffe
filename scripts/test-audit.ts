import { createAuditLog } from '../src/lib/audit';
import { prisma } from '../src/lib/prisma';

async function testAudit() {
    console.log('Testing Audit Log creation...');

    await createAuditLog({
        action: 'TEST_ACTION',
        entity: 'TestEntity',
        entityId: 'test-123',
        oldData: { status: 'OLD' },
        newData: { status: 'NEW' },
        userEmail: 'test@example.com',
        userId: 'user-123'
    });

    const logs = await prisma.auditLog.findMany({
        where: { action: 'TEST_ACTION' },
        orderBy: { createdAt: 'desc' },
        take: 1
    });

    if (logs.length > 0) {
        console.log('Success! Log found:', logs[0]);
    } else {
        console.error('Failure: Log not found!');
    }

    process.exit(0);
}

testAudit().catch(err => {
    console.error(err);
    process.exit(1);
});
