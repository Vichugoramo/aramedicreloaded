
/**
 * 
 * @param {Array<String>} roles 
 * arreglo con los roles permitidos
 * @returns {void} 
 * si el usuario tiene un rol permitido, se llama a la función next
 * si no, se envía un mensaje de error
 * Si el arreglo de roles está vacío, no se restringe el acceso, es decir, todos los roles pueden acceder
 */
module.exports = (roles) => {
    return (req, res, next) => {
        if (roles.length > 0 && !roles.includes(req?.user?.type)) {
            return res.status(403).json({ message: "Access denied" });
        }
        next();
    }
};