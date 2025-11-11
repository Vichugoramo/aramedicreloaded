CREATE DATABASE  IF NOT EXISTS `hospital` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `hospital`;
-- MySQL dump 10.13  Distrib 8.0.36, for Win64 (x86_64)
--
-- Host: localhost    Database: hospital
-- ------------------------------------------------------
-- Server version	8.0.36

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `especialidad_tipo_emergencia`
--

DROP TABLE IF EXISTS `especialidad_tipo_emergencia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `especialidad_tipo_emergencia` (
  `id_especialidad` int NOT NULL,
  `id_tipo_emergencia` int NOT NULL,
  `id` int NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_especialidad` (`id_especialidad`,`id_tipo_emergencia`),
  KEY `fk_tipo_emergencia` (`id_tipo_emergencia`),
  CONSTRAINT `especialidad_tipo_emergencia_ibfk_1` FOREIGN KEY (`id_especialidad`) REFERENCES `especialidades` (`id`),
  CONSTRAINT `especialidad_tipo_emergencia_ibfk_2` FOREIGN KEY (`id_tipo_emergencia`) REFERENCES `tipo_emergencias` (`id`),
  CONSTRAINT `fk_especialidad` FOREIGN KEY (`id_especialidad`) REFERENCES `especialidades` (`id`),
  CONSTRAINT `fk_tipo_emergencia` FOREIGN KEY (`id_tipo_emergencia`) REFERENCES `tipo_emergencias` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Table structure for table `especialidades`
--

DROP TABLE IF EXISTS `especialidades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `especialidades` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Table structure for table `medicos`
--

DROP TABLE IF EXISTS `medicos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medicos` (
  `id_usuario` int NOT NULL,
  `cedula` char(10) NOT NULL,
  `id_especialidad` int NOT NULL,
  PRIMARY KEY (`id_usuario`),
  KEY `id_especialidad` (`id_especialidad`),
  CONSTRAINT `medicos_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `medicos_ibfk_2` FOREIGN KEY (`id_especialidad`) REFERENCES `especialidades` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


-- Table structure for table `pacientes`
--

DROP TABLE IF EXISTS `pacientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pacientes` (
  `id_usuario` int NOT NULL,
  `curp` varchar(18) NOT NULL,
  `edad` int NOT NULL,
  `sexo` char(1) NOT NULL,
  `peso` decimal(10,2) NOT NULL,
  `estatura` decimal(3,2) NOT NULL,
  PRIMARY KEY (`id_usuario`),
  CONSTRAINT `pacientes_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `pacientes_chk_1` CHECK ((`sexo` in (_utf8mb4'M',_utf8mb4'F')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


-- Table structure for table `solicitudes`
--

DROP TABLE IF EXISTS `solicitudes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `solicitudes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_emergencia` int DEFAULT NULL,
  `id_medico` int DEFAULT NULL,
  `id_paciente` int NOT NULL,
  `fecha` datetime NOT NULL,
  `ubicacion_inicial` varchar(100) NOT NULL,
  `estado` varchar(10) NOT NULL,
  `notas` text,
  PRIMARY KEY (`id`),
  KEY `id_emergencia` (`id_emergencia`),
  KEY `id_medico` (`id_medico`),
  KEY `id_paciente` (`id_paciente`),
  CONSTRAINT `solicitudes_ibfk_1` FOREIGN KEY (`id_emergencia`) REFERENCES `tipo_emergencias` (`id`),
  CONSTRAINT `solicitudes_ibfk_2` FOREIGN KEY (`id_medico`) REFERENCES `medicos` (`id_usuario`),
  CONSTRAINT `solicitudes_ibfk_3` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;



--
-- Table structure for table `tipo_emergencias`
--

DROP TABLE IF EXISTS `tipo_emergencias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipo_emergencias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `descripcion` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `apellidos` varchar(50) NOT NULL,
  `email` varchar(50) NOT NULL,
  `telefono` varchar(50) NOT NULL,
  `password` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Dumping events for database 'hospital'
--

--
-- Dumping routines for database 'hospital'
--
/*!50003 DROP PROCEDURE IF EXISTS `get_user_fields_by_id` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `get_user_fields_by_id`(in id int)
begin
	
	-- DECLARE STATEMENT HAVE A LOCAL SCOPE, just inside a block of code and not outside of a function
	DECLARE is_pacient BOOLEAN DEFAULT FALSE;
    SELECT IF( EXISTS (SELECT 1 FROM pacientes WHERE pacientes.id_usuario = id) , 1, 0) INTO is_pacient;
    
    -- used to assign values to variables(either local or session variables)It 
    -- can be used outside of stored procedures as well, for session variables or local procedure variables.
    -- SET
    -- variables with @example has a global scope but only during the session of query

    IF(is_pacient) THEN
		SELECT
			usuarios.id, 
			usuarios.nombre,
			usuarios.apellidos,
			usuarios.email,
			usuarios.telefono,
            
            pacientes.curp,
            pacientes.edad,
            pacientes.sexo,
            pacientes.peso,
            pacientes.estatura,
            'paciente' as tipo
		FROM usuarios
        INNER JOIN pacientes on pacientes.id_usuario = usuarios.id
		WHERE usuarios.id = id LIMIT 1
		;
	ELSE
		SELECT
			usuarios.id, 
			usuarios.nombre,
			usuarios.apellidos,
			usuarios.email,
			usuarios.telefono,
            
            medicos.cedula,
            especialidades.nombre as especialidad,
            'medico' as tipo
		FROM usuarios
        INNER JOIN medicos on medicos.id_usuario = usuarios.id
        INNER JOIN especialidades ON especialidades.id = medicos.id_especialidad
		WHERE usuarios.id = id LIMIT 1
		;
	END IF;

    
end ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-04-29 11:43:28

-- POPULATE DATABASE ------

INSERT INTO especialidades (nombre) VALUES
('Médico General'),
('Enfermero'),
('Pediatra'),
('Geriatra'),
('Fisioterapeuta');

INSERT INTO tipo_emergencias (nombre, descripcion) VALUES
('Lesiones y Cortes', 'Si te has caído, golpeado o tienes un corte que sangra o duele.'),
('Problemas del Corazón y del Azúcar', 'Si sientes dolor en el pecho, mareos o notas que tu presión o nivel de azúcar están muy altos.'),
('Dificultades para Respirar', 'Si te cuesta respirar, sientes que te falta el aire o tienes un ataque de asma.'),
('Problemas del Cerebro o Convulsiones', 'Si sufres convulsiones, pierdes el conocimiento o notas cambios bruscos en tu forma de reaccionar.'),
('Infecciones y Fiebre Alta', 'Si tienes una fiebre muy alta o síntomas de infección que te hacen sentir muy mal.'),
('Problemas Relacionados con la Edad', 'Si eres adulto mayor y presentas caídas frecuentes, confusión o debilidad repentina, o si eres niño y tienes síntomas inusuales.'),
('Recuperación y Rehabilitación', 'Si te estás recuperando de una lesión, cirugía o accidente y necesitas ayuda para recuperar fuerza y movilidad.');

INSERT INTO especialidad_tipo_emergencia (id_especialidad, id_tipo_emergencia) VALUES
-- Lesiones y Cortes (ID 1)
(1, 1), (2, 1), (5, 1),

-- Problemas del Corazón y del Azúcar (ID 2)
(1, 2), (2, 2), (3, 2), (4, 2),

-- Dificultades para Respirar (ID 3)
(1, 3), (2, 3), (3, 3), (4, 3),

-- Problemas del Cerebro o Convulsiones (ID 4)
(1, 4), (3, 4), (4, 4),

-- Infecciones y Fiebre Alta (ID 5)
(1, 5), (2, 5), (3, 5), (4, 5),

-- Problemas Relacionados con la Edad (ID 6)
(1, 6), (3, 6), (4, 6),

-- Recuperación y Rehabilitación (ID 7)
(1, 7), (5, 7);
