function getRandomValue(arr) {
    const randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
}

function doSomeHeavyTask() {
    const ms = getRandomValue([100,150,200,250,300,800,850,900,950,1000]);
    const shouldThrowError = getRandomValue([true, false, false, false, false]);
    return new Promise((resolve, reject) => {
        if (shouldThrowError) {
            const randomError = getRandomValue([
                'Database connection failed',
                'Timeout occurred while processing',
                'Unexpected token in JSON',
                'Resource not found',
                'Permission denied'
            ]);
            return reject(new Error(randomError));
        }
        setTimeout(() => resolve(ms), ms);
    });
}

export default doSomeHeavyTask;