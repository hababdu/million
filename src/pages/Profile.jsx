import { useSelector } from "react-redux";
import Logout from "../components/Logout";

const Profile = () => {
  const user = useSelector((state) => state.auth.user);
  console.log(user);
  

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-6  rounded-lg shadow-md w-96 text-center">
        <h2 className="text-2xl font-semibold mb-4">Foydalanuvchi Profili</h2>

        {user ? (
          <div className="space-y-4">
            {user.photoURL && (
           <img
           src={user.photoURL || "/default-avatar.png"}
           alt="Profil rasmi"
           className="w-24 h-24 mx-auto rounded-full border border-gray-300"
         />
            )}
            <p className="text-lg">
              <span className="font-semibold">Ism:</span> {user.displayName || "Noma’lum"}
            </p>
            <p className="text-lg">
              <span className="font-semibold">Email:</span> {user.email}
            </p>
            <p className="text-lg">
              <span className="font-semibold">Foydalanuvchi ID:</span> {user.uid}
            </p>
          </div>
        ) : (
          <p className="text-red-500">Foydalanuvchi tizimga kirmagan.</p>
        )}
      </div>
      <Logout></Logout>
    </div>
  );
};

export default Profile;
