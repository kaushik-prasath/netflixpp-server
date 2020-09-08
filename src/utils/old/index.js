const generateMessage = async (name,text) => {
        return {
            name,
            text,
            createdAt: new Date().getTime()
        }
}

module.exports = {
    generateMessage
}