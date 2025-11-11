const patientRepository = require("../repositories/patientRepository");
const { generateToken } = require("../utils/tokenUtils");


const createPatient = async (req, res, next) => {
    const patient = req.body;
    if(
        !patient ||
        !patient.name ||
        !patient.lastname ||
        !patient.password ||
        !patient.curp ||
        !patient.age ||
        !['M', 'F'].includes(patient.sex) ||
        !patient.height ||
        !patient.weight ||
        !patient.email ||
        !patient.telephone
    ){
        return res.status(400).json({
            message: 'Petición incorrecta'
        });
    }
    try{

        const patientCreated = await patientRepository.createPatient(patient);
        const token = generateToken(patientCreated.id, "PACIENTE");
    
        const response = {
            message: "Patient created",
            token
        };
    
        return res.status(201).json(response);
    }catch(error){
        return next(error);
    }

};





module.exports = {
    createPatient
};