function findSumTatget(nums, target) {
    for (i = 0; i < nums.length; i++) {
        //เริ่มการวนหาตัวเลขตัวแรก
        for (j = i + 1; j < nums.length; j++) {
            //หสตัวเลขตัวที่ 2
            if (nums[i] + nums[j] === target) {
                return [i, j];
            }
        }
    }
    return [];
}





console.log(findSumTatget([2, 7, 11, 15], 9));