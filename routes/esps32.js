var express = require('express');
var router = express.Router();
const mongoose = require("mongoose");
const Huella = mongoose.model("huellas");
const Humedad = mongoose.model("humedad");
const Aire = mongoose.model("aire");
const Gas = mongoose.model("gas");
const registro = mongoose.model("registro");
const fs = require('fs');
const path = require('path');
const estadoLEDPath = path.join(__dirname, 'estadoLED.json');

let estadoLED = fs.existsSync(estadoLEDPath) ? JSON.parse(fs.readFileSync(estadoLEDPath, 'utf8')).estado : 0;

//sensor de huellas
router.post('/Enroll', async function(req, res, next) {

  let huellas = new Huella({
    userid: req.body.userid,
    nombre: req.body.nombre,
    apellido: req.body.apellido,
    telefono: req.body.telefono,
    puesto: req.body.puesto,
    foto: req.body.foto,
    estado:0,

  });

  try {
    await huellas.save(); 
    res.send({ huellas });
  } catch (error) {
    next(error); 
  }
});

router.get('/anyEnroll', async function(req, res, next) {
  // Buscar una huella cuyo estado indique que está pendiente de enrollamiento
  let huellaPendiente = await Huella.findOne({ estado: 0 }); // Asumiendo que '1' indica pendiente
  
  if (!huellaPendiente) {
    return res.status(404).send("No hay huellas pendientes de enrollamiento");
  }

  return res.status(200).send({huellaPendiente});
});

router.post('/confirmEnroll', async function(req, res, next) {
  // Actualizar el estado de la huella para indicar que el enrollamiento ha sido completado
  let huellaActualizada = await Huella.findOneAndUpdate(
    { userid: req.body.userid },
    { estado: 1,
      huellaId: req.body.huellaId
    }, // Asumiendo que '1' indica enrollamiento completado
    { new: true }
  );

  if (!huellaActualizada) {
    return res.status(404).send("Huella no encontrada o ya fue enrollada");
  }

  return res.status(200).send({huellaActualizada});
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

router.get('/estado-actual', function(req, res) {
  let estadoLED;
  try {
    const data = fs.readFileSync(estadoLEDPath, 'utf8');
    estadoLED = JSON.parse(data).estado;
  } catch (err) {
    console.error('Error al leer el archivo:', err);
    return res.status(500).send({ mensaje: "Error al leer el estado del LED" });
  }

  const accionLED = estadoLED === 1 ? "encender" : "apagar";
  res.json({ accionLED: accionLED });
});

// Endpoint POST para cambiar el estado del LED desde la página web
router.post('/cambiar-estado', function(req, res) {
  const estado = Number(req.body.estado);
  try {
    fs.writeFileSync(estadoLEDPath, JSON.stringify({ estado: estado }), 'utf8');
    res.json({ mensaje: `Estado cambiado a ${estado}` });
  } catch (err) {
    console.error('Error al escribir en el archivo:', err);
    return res.status(500).send({ mensaje: "Error al cambiar el estado del LED" });
  }
});

//ruta para registrar aire
router.post('/aire', async function(req, res, next) {
  try {
    if (!req.body.CO2) {
      return res.status(400).send({ mensaje: "El campo CO2 es obligatorio" });
    }
    let nuevoAire = new Aire({
      CO2: req.body.CO2,
      estado: estadoLED, 
    });

    let resultado = await nuevoAire.save();

    // Lógica para determinar si se debe encender o apagar el LED
    let accionLED = estadoLED === 1 ? "encender" : "apagar"; // Ahora usamos 'estadoLED' para la lógica

    // Envía la respuesta con la acción a realizar por el ESP32
    res.status(201).send({ mensaje: "Datos de calidad del aire insertados con éxito", accionLED, resultado });
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