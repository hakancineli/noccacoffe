import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
    try {
        const staffMembers = [
            {
                name: 'Ceren Alper',
                email: 'ceren@noccacoffee.com',
                role: 'MANAGER',
                password: '123',
                phone: '5551234567'
            },
            {
                name: 'Can Tecirli',
                email: 'can@noccacoffee.com',
                role: 'MANAGER',
                password: '123',
                phone: '5557654321'
            },
            {
                name: 'Kasa Personeli',
                email: 'kasa@noccacoffee.com',
                role: 'BARISTA',
                password: '123',
                phone: '5550000000'
            }
        ];

        const results = [];

        for (const member of staffMembers) {
            const hash = await bcrypt.hash(member.password, 10);

            // Upsert Staff
            const staff = await prisma.barista.upsert({
                where: { email: member.email },
                update: {
                    name: member.name,
                    // @ts-ignore
                    role: member.role,
                    passwordHash: hash
                },
                create: {
                    name: member.name,
                    email: member.email,
                    // @ts-ignore
                    role: member.role,
                    passwordHash: hash,
                    phone: member.phone,
                    salary: 0,
                    startDate: new Date(),
                    isActive: true
                }
            });
            results.push(staff.name);
        }

        return NextResponse.json({
            message: 'Staff accounts setup completed successfully.',
            created: results
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Setup failed', details: error }, { status: 500 });
    }
}
