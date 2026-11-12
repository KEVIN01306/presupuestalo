import { PrismaClient } from "@prisma/client";
// import { BcryptHashProvider } from "../src/shared/infrastructure/bcrypt-hash.provider.js";

const prisma = new PrismaClient();
// const hashProvider = new BcryptHashProvider();

const DEFAULT_CURRENCIES = [
    { code: "GTQ", name: "Quetzal", symbol: "Q" },
    { code: "USD", name: "Dólar estadounidense", symbol: "$" },
    { code: "HNL", name: "Lempira", symbol: "L" },
    { code: "NIO", name: "Córdoba oro", symbol: "C$" },
    { code: "CRC", name: "Colón costarricense", symbol: "₡" },
    { code: "PAB", name: "Balboa", symbol: "B/." },
    { code: "MXN", name: "Peso mexicano", symbol: "$" },
] as const;

async function main() {
    for (const currency of DEFAULT_CURRENCIES) {
        await prisma.currency.upsert({
            where: { code: currency.code },
            update: {
                name: currency.name,
                symbol: currency.symbol,
                isActive: true,
            },
            create: {
                code: currency.code,
                name: currency.name,
                symbol: currency.symbol,
                isActive: true,
            },
        });
    }
    console.log(`✅ ${DEFAULT_CURRENCIES.length} monedas sincronizadas correctamente.`);

    const usdCurrency = await prisma.currency.findUnique({
        where: { code: "USD" },
    });

    if (usdCurrency) {
        const updatedTeams = await prisma.team.updateMany({
            where: { currencyId: null },
            data: { currencyId: usdCurrency.id },
        });
        console.log(`✅ Equipos sin moneda actualizados a USD: ${updatedTeams.count}`);
    }

    /*
    const demoEmail = "kevin01306@gmail.com";

    let demoUser = await prisma.user.findUnique({
        where: { email: demoEmail },
    });

    if (!demoUser) {
        const passwordHash = await hashProvider.hash("12345678");

        demoUser = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email: demoEmail,
                    passwordHash,
                    firstName: "Kevin",
                    lastName: "Sánchez",
                    isActive: true,
                    isVerify: true,
                },
            });

            const personalTeam = await tx.team.create({
                data: {
                    name: "Mi Espacio Personal",
                    description: "Espacio personal de presupuestos",
                    isPersonal: true,
                    ownerId: user.id,
                    currencyId: usdCurrency?.id ?? null,
                },
            });

            await tx.teamMember.create({
                data: {
                    teamId: personalTeam.id,
                    userId: user.id,
                    role: "OWNER",
                },
            });

            await tx.incomeCategory.createMany({
                data: [
                    {
                        teamId: personalTeam.id,
                        name: "Salario mensual",
                        isSystem: false,
                    },
                    {
                        teamId: personalTeam.id,
                        name: "Sobrante presupuesto anterior",
                        isSystem: true,
                    },
                ],
            });

            return user;
        });

        console.log(`✅ Usuario demo creado con espacio personal y categorías por defecto: ${demoEmail}`);
    } else {
        // Ensure personal team & default categories exist for demo user
        const existingPersonalTeam = await prisma.team.findFirst({
            where: { ownerId: demoUser.id, isPersonal: true },
        });

        if (!existingPersonalTeam) {
            await prisma.$transaction(async (tx) => {
                const personalTeam = await tx.team.create({
                    data: {
                        name: "Mi Espacio Personal",
                        description: "Espacio personal de presupuestos",
                        isPersonal: true,
                        ownerId: demoUser!.id,
                        currencyId: usdCurrency?.id ?? null,
                    },
                });

                await tx.teamMember.create({
                    data: {
                        teamId: personalTeam.id,
                        userId: demoUser!.id,
                        role: "OWNER",
                    },
                });

                await tx.incomeCategory.createMany({
                    data: [
                        {
                            teamId: personalTeam.id,
                            name: "Salario mensual",
                            isSystem: false,
                        },
                        {
                            teamId: personalTeam.id,
                            name: "Sobrante presupuesto anterior",
                            isSystem: true,
                        },
                    ],
                });
            });
            console.log(`✅ Espacio personal creado para usuario existente: ${demoEmail}`);
        } else {
            console.log(`ℹ️ Usuario demo y espacio personal ya existen: ${demoEmail}`);
        }
    }
    */

    console.log("¡Seed ejecutado con éxito!");
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error("❌ Error durante la ejecución del seed:", e);
        await prisma.$disconnect();
        process.exit(1);
    });
