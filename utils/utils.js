export const vecotrize = (pose) => {
    var ten = pose
        .keypoints
        .map((item, key) => {
            return [item.position.x, item.position.y];
        })
        .flat();

    var xlist = pose
        .keypoints
        .map((item) => {
            return [item.position.x];
        })
        .flat();

    var ylist = pose
        .keypoints
        .map((item) => {
            return [item.position.y];
        })
        .flat();

    const x_max = Math
        .max
        .apply(null, xlist);
    const y_max = Math
        .max
        .apply(null, ylist);
    const x_min = Math
        .min
        .apply(null, xlist);
    const y_min = Math
        .min
        .apply(null, ylist);
    const w = x_max - x_min;
    const h = y_max - y_min;

    for (var i = 0; i < 34; i++) {
        if (i % 2 === 0) {
            ten[i] = (ten[i] - x_min) / w;
        } else {
            ten[i] = (ten[i] - y_min) / h;
        }
    }

    const leftHip_x = ten[24];
    const leftHip_y = ten[25];
    const rightHip_x = ten[26];
    const rightHip_y = ten[27];
    var mHip_x,
        mHip_y,
        l;

    if (leftHip_x > 0 && leftHip_y > 0 && rightHip_x > 0 && rightHip_y > 0) {
        mHip_x = (leftHip_x + rightHip_x) / 2
        mHip_y = (leftHip_y + rightHip_y) / 2
    } else if (leftHip_x <= 0 || leftHip_y <= 0) {
        mHip_x = rightHip_x
        mHip_y = rightHip_y
    } else {
        mHip_x = leftHip_x
        mHip_y = leftHip_y
    }

    for (var i = 0; i < 34; i++) {
        if (i % 2 === 0) {
            ten[i] = mHip_x - ten[i]
        } else {
            ten[i] = mHip_y - ten[i]
            l = (ten[i - 1] ** 2 + ten[i] ** 2) ** (0.5)
            ten[i - 1] /= l
            ten[i] /= l
        }
    }

    return ten;
}