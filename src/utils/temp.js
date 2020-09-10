const users = []

const addUser = ({ id, name, room, admin }) => {

    // Validate the data
    if (!name || !room) {
        return {
            error: 'name and room are required!'
        }
    }

    // Check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.name === name
    })

    // Validate name
    if (existingUser) {
        return {
            error: 'Name is in use!'
        }
    }

    // Store user
    const user = { id, name, room, admin }
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)

    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    return users.find((user) => user.id === id)
}

const getUsersInRoom = (room) => {
    return users.filter((user) => user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}