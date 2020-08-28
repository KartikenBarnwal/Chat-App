const users = []

//addUser, removeUser, getUser, getUsersInRoom

const addUser = ({id, username, room}) => {
    //clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //check for existing username
    const existingUser = users.find((user)=>{
        return user.room == room && user.username == username 
    })

    if(existingUser)
    {
        return{
            error: 'Username is in use!'
        }
    }

    const user = {id, username, room}
    users.push(user)
    return{user}
}

const removeUser = (id) => {
    const index = users.findIndex((user)=>{
        return user.id == id
    })

    if(index!=-1)
    {
        return users.splice(index,1)[0]
    }
}

const getUser = (id) => {
    // console.log(users)
    const user = users.find((user)=>{
        return user.id==id
    })
    if(user)
    {
        // console.log(user)
        return user
    }
}

const getUsersInRoom = (room) => {

    // console.log(users)
    const usersInRoom = users.filter((user)=>{
        return user.room == room
    })
    // console.log(usersInRoom)
    return usersInRoom
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}