var express = require('express');
var router = express.Router();
const mongoose = require("mongoose");
const Huella = mongoose.model("huellas");
const Humedad = mongoose.model("humedad");
const Aire = mongoose.model("aire");
const Gas = mongoose.model("gas");
const registro = mongoose.model("registro");

//sensor de huellas
router.post('/registrarNuevaHuella', async function(req, res, next) {

  let huellas = new Huella({
    huellaId: req.body.huellaId,
    nombre: req.body.nombre,
    apellido: req.body.apellido,
    telefono: req.body.telefono,
    puesto: req.body.puesto,
    foto: req.body.foto,
  });

  try {
    await huellas.save(); 
    res.send({ huellas });
  } catch (error) {
    next(error); 
  }
});
//ruta pra obtener todas las huellas
router.get('/', async function(req, res, next) {
  let huellas = await Huella.find({});
  res.send({huellas})

});
// ruta para eliminar una huella
router.delete('/eliminar/:id', async function(req, res, next) {
  try {
    
    const resultado = await Huella.deleteOne({ huellaId: req.params.id });
    if (resultado.deletedCount === 0) {
      
      return res.status(404).send({ mensaje: 'Huella no encontrada' });
    }
    
    res.send({ mensaje: 'Huella eliminada con éxito' });
  } catch (error) {
    
    next(error);
  }
});

//sensor hdt11
//ruta para obtener la humedad
router.get('/humedad', async function(req, res, next) {
  let humedad = await Humedad.find({});
  res.send({humedad})

});
//ruta para registrar la humedad
router.post('/humedad', async function(req, res, next) {
  try {
    let humedad = new Humedad({
      Humedad: req.body.Humedad,
      temperatura: req.body.temperatura
    });
    let resultado = await humedad.save(); 
    res.send({resultado});
  } catch (error) {
    
    res.status(500).send(error);
  }
});

//sensor mq135
//ruta para obtener aire
router.get('/aire', async function(req, res, next) {
  let aire = await Aire.find({});
  res.send({aire})

});
//ruta para registrar aire
router.post('/aire', async function(req, res, next) {
  try {
    if (!req.body.CO2) {
      return res.status(400).send({ mensaje: "El campo CO2 es obligatorio" });
    }
    let nuevoAire = new Aire({
      CO2: req.body.CO2
    });
    let resultado = await nuevoAire.save();
    res.status(201).send({ mensaje: "Datos de calidad del aire insertados con éxito", resultado });
  } catch (error) {
    res.status(500).send({ mensaje: "Error al insertar datos de calidad del aire", error: error.message });
  }
});


//sensor mq2
//ruta para obtener gas
router.get('/gas', async function(req, res, next) {
  let gas = await Gas.find({});
  res.send({gas})

});

//ruta para registrar gas 
router.post('/gas', async function(req, res, next) {
  try {
    if (!req.body.gas) {
      return res.status(400).send({ mensaje: "El campo valor es obligatorio" });
    }
    let nuevoGas = new Gas({
      gas: req.body.gas
    });
    let resultado = await nuevoGas.save();
    res.status(201).send({ mensaje: "Datos de gas insertados con éxito", resultado });
  } catch (error) {
    res.status(500).send({ mensaje: "Error al insertar datos de gas", error: error.message });
  }
});

// Ruta para registrar horario
router.post('/registrarhorario', async function(req, res, next) {
  let fechaActual = new Date(); // Obtiene la fecha y hora actuales

  let nuevoregistro = new registro({
    huellaId: req.body.huellaId,
    fechaHora: fechaActual,
  });

  try {
    await nuevoregistro.save(); 
    
    res.send({ success: true, message: "Registro guardado exitosamente.", data: nuevoregistro });
  } catch (error) {
    
    res.status(500).send({ success: false, message: "Error al guardar el registro. Por favor, inténtelo de nuevo." });
  }
});
//  Ruta para obtener horario
router.get('/obtenerhorarios', async function(req, res, next) {
  let registros = await registro.find({});
  res.send({registros});
});


module.exports = router;