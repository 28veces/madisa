import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany({
    include: {
      business: true
    }
  })
  
  console.log('Usuarios encontrados:', users.length)
  console.log('---')
  users.forEach((user: any) => {
    console.log(`Email: ${user.email}`)
    console.log(`Nombre: ${user.name || 'N/A'}`)
    console.log(`Rol: ${user.role}`)
    console.log(`Negocio: ${user.business?.name || 'Sin negocio'}`)
    console.log(`Creado: ${user.createdAt}`)
    console.log('---')
  })
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
