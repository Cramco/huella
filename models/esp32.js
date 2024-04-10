const mongoose = require("mongoose");
//tabla de huellas
const HuellaSchema = new mongoose.Schema(
    {
        fechaHora: String,
        userid:Number,
        huellaId: Number,
        nombre:String,
        apellido: String,
        telefono: Number,
        puesto: String,
        foto: String,
        estado: Number,
    }, 
);
mongoose.model("huellas",HuellaSchema);

//tabla de registro
const Registro = new mongoose.Schema(
    {
        fechaHora: String,
        huellaId: Number,
        
    }, 
);
mongoose.model("registro",Registro);

//tabla de temperatura 

const Humedad = new mongoose.Schema({
    Humedad: Number,
    temperatura: Number,
    }, { timestamps: true }
);

mongoose.model("humedad", Humedad);


//tabla de calidad de aire

const Aire = new mongoose.Schema({
        CO2: Number,
        estado: Number,
    }, { timestamps: true }
);
mongoose.model("aire",Aire);

//tabla de gas 

const Gas = new mongoose.Schema(
    {
        gas: Number,
    },{ timestamps: true }
);
mongoose.model("gas",Gas);

