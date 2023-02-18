const Client = require("./../client/model");
const hashData = require("./../../util/hashData");
const verifyHashedData = require("./../../util/verifyHashedData");
const { ROLES } = require("./../../security/role");
const {
  sendOTPVerificationEmail,
} = require("./../otp_verification/controller");
const jwt = require("jsonwebtoken");
const CreateClient = async (data) => {
  try {
    const { fullname, email, password } = data;
    const existingClient = await Client.findOne({ email: email });
    if (existingClient != null) {
      //A user aleady exist
      throw Error("Email already exist");
    } else {
      //User doesn't exist so we can save him as a new user

      //Hashing Password
      const hashedPassword = await hashData(password);
      const newClient = new Client({
        fullname,
        email,
        password: hashedPassword,
        verified: false,
        role: ROLES.CLIENT,
      });
      //Save the organization
      const createdClient = await newClient.save();
      return createdClient;
    }
  } catch (error) {
    throw error;
  }
};
// User Auth
const AuthenticateClient = async (email, password) => {
  try {
    const fetchedClient = await Client.findOne({ email: email });
    if (fetchedClient != null) {
      const hashedPasswordClient = fetchedClient.password;
      const passwordMatchClient = await verifyHashedData(
        password,
        hashedPasswordClient
      );
      if (passwordMatchClient === false) {
        throw Error("Invalid login , verify your email or password");
      } else {
        if (!fetchedClient.verified) {
          await sendOTPVerificationEmail(fetchedClient);
          return {
            status: "Verify",
            message: "Verify your account",
            id: fetchedClient._id,
          };
        }
        //password match
        const token = jwt.sign(
          {
            id: fetchedClient._id,
            email: fetchedClient.email,
            role: ROLES.CLIENT,
          },
          process.env.SECRET,
          {
            expiresIn: "7d",
          }
        );
        fetchedClient.token = token;
        return {
          status: "Success",
          message: "Client Found",
          whoami: "Client",
          token: "Bearer " + fetchedClient.token,
          user: fetchedClient,
        };
      }
    } else {
      throw Error("Invalid acredentials");
    }
  } catch (error) {
    throw error;
  }
};
const ForgetPassword = async (email) => {
  try {
    const fetchedClient = await Client.findOne({ email: email });
    if (fetchedClient != null) {
      await sendOTPVerificationEmail(fetchedClient);
      return fetchedClient;
    } else if (fetchedHotel != null) {
      const _id = fetchedHotel._id;
      const email = fetchedHotel.hotelEmail;
      await sendOTPVerificationEmail({ _id, email });
      return fetchedHotel;
    } else if (fetchedAdmin != null) {
      await sendOTPVerificationEmail(fetchedAdmin);
      return fetchedAdmin;
    } else {
      throw Error("Email does not exist");
    }
  } catch (error) {
    throw error;
  }
};

const ResetPassword = async (newPassword, email) => {
  try {
    const hashedPasswordUser = await hashData(newPassword);
    const fetchedClient = await Client.findOne({ email: email });
    if (fetchedClient != null) {
      const hashedPassword = fetchedClient.password;
      const passwordMatch = await verifyHashedData(newPassword, hashedPassword);
      console.log(passwordMatch);
      if (passwordMatch === false) {
        await Client.updateOne(
          { email: email },
          { password: hashedPasswordUser }
        );
        return { status: "Success", message: "Password changed" };
      } else {
        throw Error("New password cannot be same as old password");
      }
    } else {
      throw Error("Email does not exist");
    }
  } catch (error) {
    throw error;
  }
};

module.exports = {
  CreateClient,
  ForgetPassword,
  ResetPassword,
  AuthenticateClient,
};
