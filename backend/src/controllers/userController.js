const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = new PrismaClient();

// Registrar nuevo usuario
const register = async (req, res) => {
  try {
    console.log("Datos recibidos:", req.body);
    const { name, email, password } = req.body;

    // Validar campos requeridos
    if (!name || !email || !password) {
      console.log("Campos faltantes:", { name: !name, email: !email, password: !password });
      return res.status(400).json({ error: "Todos los campos son requeridos" });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log("Email inválido:", email);
      return res.status(400).json({ error: "Formato de email invalido" });
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      console.log("Contraseña demasiado corta:", password.length);
      return res
        .status(400)
        .json({ error: "La contraseña debe tener al menos 6 caracteres" });
    }

    console.log("Buscando usuario existente con email:", email);
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log("Usuario ya existe:", existingUser);
      return res.status(400).json({ error: "El email ya esta registrado" });
    }

    console.log("Hasheando contraseña...");
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("Iniciando transacción para crear usuario y carrito...");
    // Crear usuario y carrito en una transaccion
    const result = await prisma.$transaction(async (prisma) => {
      console.log("Creando usuario...");
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });
      console.log("Usuario creado:", user);

      console.log("Creando carrito...");
      // Crear carrito para el usuario
      const cart = await prisma.cart.create({
        data: {
          userId: user.id,
        },
      });
      console.log("Carrito creado:", cart);

      return user;
    });

    console.log("Generando token JWT...");
    const token = jwt.sign(
      { userId: result.id },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    console.log("Registro completado exitosamente");
    res.status(201).json({
      user: {
        id: result.id,
        name: result.name,
        email: result.email,
        role: result.role,
      },
      token,
    });
  } catch (error) {
    console.error("Error detallado en registro:", error);
    res.status(500).json({ error: "Error al registrar usuario" });
  }
};

// Login de usuario
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar campos requeridos
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email y contraseña son requeridos" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: "Credenciales invalidas" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Credenciales invalidas" });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "2h" } // Token valido por 2 horas
    );

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error al iniciar sesion" });
  }
};

// Obtener perfil de usuario
const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    res.status(500).json({ error: "Error al obtener informacion del usuario" });
  }
};

// Google authentication
const googleAuth = async (req, res) => {
  try {
    const { email, name, googleId } = req.body;

    if (!email || !name || !googleId) {
      return res.status(400).json({ error: "Datos de Google incompletos" });
    }

    // Buscar usuario existente o crear uno nuevo
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { googleId }
        ]
      }
    });

    if (!user) {
      // Crear nuevo usuario con Google
      user = await prisma.user.create({
        data: {
          email,
          name,
          googleId,
          role: "CLIENT",
          password: null // Los usuarios de Google no tienen contraseña
        }
      });
    } else if (!user.googleId) {
      // Actualizar usuario existente con Google ID
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId }
      });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Error en autenticación con Google:", error);
    res.status(500).json({ error: "Error en autenticación con Google" });
  }
};

module.exports = {
  register,
  login,
  getMe,
  googleAuth
};
