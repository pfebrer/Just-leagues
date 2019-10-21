//Contains all the parameters that can be used to tune the app

export default SETTINGS = {
    pointsScheme: [
        {
            result: [3,0],
            points: [7,1],
        },

        {
            result: [3,1],
            points: [6,2],
        },

        {
            result: [3,2],
            points: [5,3],
        }
    ], //Describes how the point distribution works.
    groupSize: 4, //Number of players each group should have under normal circumstances
    minGroupSize: 3, //If last group has less players than this, they will be joined into the previous group
    appearance: {
        backgroundColor: "#ffe39f"
    }
}