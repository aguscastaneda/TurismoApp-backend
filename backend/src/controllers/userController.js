const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = new PrismaClient();

//  Garantizar que el usuario tenga un carrito
const ensureUserHasCart = async (userId) => {
  try {
    const existingCart = await prisma.cart.findUnique({
      where: { userId }
    });

    if (!existingCart) {
      return await prisma.cart.create({
        data: { userId }
      });
    }

    return existingCart;
  } catch (error) {
    console.error("Error al garantizar que el usuario tenga carrito:", error);
    throw error;
  }
};

// Registrar nuevo usuario
const register = async (req, res) => {
  try {
    console.log("Datos recibidos:", req.body);
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      console.log("Campos faltantes:", { name: !name, email: !email, password: !password });
      return res.status(400).json({ error: "Todos los campos son requeridos" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log("Email invalido:", email);
      return res.status(400).json({ error: "Email invalido" });
    }

    if (password.length < 6) {
      console.log("Contraseña demasiado corta:", password.length);
      return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
    }

    console.log("Buscando usuario existente con email:", email);
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log("Usuario ya existe:", existingUser);
      return res.status(400).json({ error: "El email ya esta registrado" });
    }

    console.log("Hasheando contraseña...");
    const hashedPassword = await bcrypt.hash(password, 10);

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
    await prisma.cart.create({
      data: {
        userId: user.id,
      },
    });

    console.log("Carrito creado para el usuario");

    console.log("Generando token JWT...");
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    const { password: _, ...userWithoutPassword } = user;

    console.log("Registro completado exitosamente");
    res.status(201).json({
      message: "Usuario registrado exitosamente",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({ error: "Error interno del servidor" });
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

    // Asegurar que el usuario tenga un carrito
    await ensureUserHasCart(user.id);

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

      // Asegurar que el usuario tenga un carrito
      await ensureUserHasCart(user.id);
    } else if (!user.googleId) {
      // Actualizar usuario existente con Google ID
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId }
      });
    }

    // Asegurar que el usuario tenga un carrito (por si acaso)
    await ensureUserHasCart(user.id);

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
