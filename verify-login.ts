import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function verifyLogin() {
  // Verificar que el usuario existe
  const user = await prisma.user.findUnique({
    where: { email: 'admin@artemadisa.com' }
  })

  if (!user) {
    console.log('❌ Usuario no encontrado en la BD')
    return
  }

  console.log('✅ Usuario encontrado:', user.email)
  console.log('   Nombre:', user.name)
  console.log('   Rol:', user.role)

  // Verificar que la contraseña es correcta
  const passwordValid = await bcrypt.compare('admin123', user.passwordHash)
  
  if (passwordValid) {
    console.log('✅ Contraseña válida')
    console.log('\n✅ LOGIN DEBERÍA FUNCIONAR')
  } else {
    console.log('❌ Contraseña inválida')
  }
}

verifyLogin()
  .then(() => process.exit(0))
  .catch(e => {
    console.error('Error:', e.message)
    process.exit(1)
  })
