"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userModel_1 = __importDefault(require("../models/userModel"));
const logger_1 = __importDefault(require("../utils/logger"));
// 定义要修改的信息
const currentUsername = 'admin'; // 当前用户名
const newUsername = 'yealqp'; // 新用户名
const newPassword = 'Zzq20110128@'; // 新密码
async function updateUserInfo() {
    try {
        logger_1.default.info(`开始更新用户 ${currentUsername} 的信息...`);
        // 使用我们新添加的方法更新用户信息
        const updatedUser = await userModel_1.default.updateUser(currentUsername, newUsername, newPassword);
        if (!updatedUser) {
            logger_1.default.error(`用户 ${currentUsername} 不存在，无法更新信息。`);
            return;
        }
        logger_1.default.info(`用户信息更新成功！`);
        logger_1.default.info(`新用户名: ${newUsername}`);
        logger_1.default.info(`更新时间: ${updatedUser.updatedAt}`);
    }
    catch (error) {
        logger_1.default.error(`更新用户信息时发生错误: ${error}`);
    }
}
// 执行更新
updateUserInfo();
