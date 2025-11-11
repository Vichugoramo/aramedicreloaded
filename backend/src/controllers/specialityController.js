const specialityRepository = require('../repositories/specialityRepository');


/**
 * 
 * @returns {Promise<speciality[]:{id: number, name: string}[]>} array de especialidades
 */
const getSpecialities = async (req, res, next) => {
    try{

        const specialitiesResultDb = await specialityRepository.getSpecialities();
        const specialities = specialitiesResultDb.map(speciality => {
            return { id: speciality.id, name: speciality.nombre };
        });
        return res.json({specialities});

    }catch(error){
        console.log(error);
        next(error);
    }
};



module.exports = {
    getSpecialities
};