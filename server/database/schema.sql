-- ==================== ESQUEMA DE BASE DE DATOS CROPTRACK ====================

-- Crear base de datos de test si no existe
CREATE DATABASE IF NOT EXISTS croptrack_test
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE croptrack_test;

-- ==================== TABLA USERS ====================
CREATE TABLE IF NOT EXISTS `users` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellido` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre_usuario` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rol` enum('administrador','supervisor','trabajador') COLLATE utf8mb4_unicode_ci NOT NULL,
  `empresa` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `imagen_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ultimo_acceso` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre_usuario` (`nombre_usuario`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== TABLA CROPS ====================
CREATE TABLE IF NOT EXISTS `crops` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `empresa` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `usuario_creador_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `variedad` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `area_hectareas` decimal(10,2) DEFAULT NULL,
  `ubicacion` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `imagen_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_siembra` date DEFAULT NULL,
  `fecha_cosecha_estimada` date DEFAULT NULL,
  `fecha_cosecha_real` date DEFAULT NULL,
  `estado` enum('planificado','sembrado','en_crecimiento','maduro','cosechado','cancelado') COLLATE utf8mb4_unicode_ci DEFAULT 'planificado',
  `notas` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `usuario_creador_id` (`usuario_creador_id`),
  CONSTRAINT `crops_ibfk_1` FOREIGN KEY (`usuario_creador_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== TABLA MEASUREMENTS ====================
CREATE TABLE IF NOT EXISTS `measurements` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cultivo_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `usuario_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_medicion` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `valor` decimal(10,2) NOT NULL,
  `unidad` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_medicion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `imagen_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `cultivo_id` (`cultivo_id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `measurements_ibfk_1` FOREIGN KEY (`cultivo_id`) REFERENCES `crops` (`id`) ON DELETE CASCADE,
  CONSTRAINT `measurements_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== TABLA TASKS ====================
CREATE TABLE IF NOT EXISTS `tasks` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `empresa` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cultivo_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `creado_por` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `asignado_a` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `titulo` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `prioridad` enum('baja','media','alta','urgente') COLLATE utf8mb4_unicode_ci DEFAULT 'media',
  `estado` enum('pendiente','en_proceso','completada','cancelada') COLLATE utf8mb4_unicode_ci DEFAULT 'pendiente',
  `fecha_inicio` date DEFAULT NULL,
  `fecha_limite` date DEFAULT NULL,
  `fecha_completada` timestamp NULL DEFAULT NULL,
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `imagen_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `cultivo_id` (`cultivo_id`),
  KEY `creado_por` (`creado_por`),
  KEY `asignado_a` (`asignado_a`),
  CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`cultivo_id`) REFERENCES `crops` (`id`) ON DELETE SET NULL,
  CONSTRAINT `tasks_ibfk_2` FOREIGN KEY (`creado_por`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `tasks_ibfk_3` FOREIGN KEY (`asignado_a`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== TABLA CROP_WORKERS (junction muchos a muchos) ====================
CREATE TABLE IF NOT EXISTS `crop_workers` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cultivo_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `usuario_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cultivo_usuario` (`cultivo_id`, `usuario_id`),
  KEY `cultivo_id` (`cultivo_id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `cw_fk_crop` FOREIGN KEY (`cultivo_id`) REFERENCES `crops` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cw_fk_user` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
