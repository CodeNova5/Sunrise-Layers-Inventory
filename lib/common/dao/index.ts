import UserDAO from "./user";
import LogDAO from "./log";

const DAO = {
    User: UserDAO,
    Log: LogDAO,
};
export default DAO;
export { UserDAO, LogDAO };
