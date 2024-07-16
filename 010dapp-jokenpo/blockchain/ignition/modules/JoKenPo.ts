import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const JoKenPoModule = buildModule("JoKenPoModule", (m) => {
   const joKenPo = m.contract("JoKenPo");

  return { joKenPo };
});

export default JoKenPoModule;
