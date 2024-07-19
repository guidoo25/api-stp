CREATE PROCEDURE `InsertarReservaDevents`(
    IN p_id_cabecera INT,
    IN p_id_evento INT,
    IN p_id_estado INT,
    IN p_created_at DATETIME,
    IN p_update_at DATETIME,
    IN p_delete_at DATETIME
)
BEGIN
    DECLARE exit handler for sqlexception
    BEGIN
        ROLLBACK;
    END;

    START TRANSACTION;
    
    INSERT INTO macrologistic.macro_tb_reservas_motores_det
    ( id_cabecera, id_evento, id_estado, created_at)
    VALUES( p_id_cabecera, p_id_evento, p_id_estado, NOW());
    
    COMMIT;
END

ALTER TABLE macrologistic.macro_tb_reservas_motores_det MODIFY COLUMN id bigint auto_increment NOT NULL;


CREATE PROCEDURE `actualizarEstadoDriverReserva`(IN `idReserva` BIGINT, IN `nuevoEstado` INT)
BEGIN
    UPDATE macro_tb_reservas_motores_cab
    SET estado_driver_reserva = nuevoEstado
    WHERE id_reserva = idReserva;
END 

CREATE DEFINER=`macrologistic_desarrollo`@`%` PROCEDURE `macrologistic`.`actualizarEstadoReserva`(IN `idReserva` BIGINT, IN `nuevoEstado` INT)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ocurrió un error al actualizar el estado de la reserva.';
    END;

    START TRANSACTION;
    
    UPDATE macro_tb_reservas_motores_cab
    SET estado_reserva = nuevoEstado
    WHERE id_reserva = idReserva;
    
    COMMIT;
END

 SELECT 
        mte.id AS empresa_id_user,
        tp.nombres,
        tp.apellidos,
        rmc.refrencia_reserva,
        rmc.fecha_inicio_reserva,
        rmc.precio_empresa,
        rmc.precio_motor,
        rmc.precio_ganancia_neta,
        rmc.porcentaje_ganancia,
        rmc.id_conductor
        
    FROM 
        tb_usuarios u
    LEFT JOIN 
        macro_tb_empresas mte ON u.id_usuario = mte.id_user 
    JOIN 
        macro_tb_reservas_motores_cab rmc ON rmc.motores_reserva_id = mte.id 
    LEFT JOIN 
        tb_perfil tp ON tp.id_perfil = mte.id_user
    WHERE 
        u.id_padre = idPadre;

