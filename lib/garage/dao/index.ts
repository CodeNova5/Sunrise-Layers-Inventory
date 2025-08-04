import UserDAO from "../../common/dao/user";
import LogDAO from "../../common/dao/log";
import CustomerDAO from "./customer";

const DAO = {
    User: UserDAO,
    Log: LogDAO,
    Customer: CustomerDAO,
}

export default DAO
export { UserDAO, LogDAO, CustomerDAO}
