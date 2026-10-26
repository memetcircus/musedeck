import { AgentStateMachine } from "../src/agent/state-machine.js";
import { MuseRunner } from "../src/agent/muse-runner.js";
import { AgentState } from "../src/agent/types.js";

async function runTests() {
  console.log("🧪 --- RUNNING AGENT STATE MACHINE & HITL GATE TESTS ---");

  const sm = new AgentStateMachine();
  const runner = new MuseRunner(sm, { simulationMode: true });

  // Test 1: Initial state
  console.assert(sm.getState() === AgentState.IDLE, "Initial state should be IDLE");
  console.log("✅ Initial state is IDLE");

  // Test 2: Start task -> Planning -> Waiting Approval
  const taskPromise = runner.runTask("Test unit suite generation");
  
  // Wait for state to reach WAITING_APPROVAL
  await new Promise<void>((resolve) => {
    sm.on("stateChange", (state) => {
      if (state === AgentState.WAITING_APPROVAL) resolve();
    });
  });

  console.assert(sm.getState() === AgentState.WAITING_APPROVAL, "State should be WAITING_APPROVAL");
  const tel = sm.getTelemetry();
  console.assert(tel.diffStats.filesChanged > 0, "Diff stats should reflect modified files");
  console.log(`✅ State transitioned to WAITING_APPROVAL with diff: +${tel.diffStats.insertions} / -${tel.diffStats.deletions}`);

  // Test 3: Physical Approval keypress
  console.log("⚡ Simulating physical keypress on APPROVE key...");
  const approved = await runner.approve("Verified by developer");
  console.assert(approved === true, "Approval should succeed");

  await taskPromise;
  console.assert(sm.getState() === AgentState.IDLE, "State should return to IDLE after task completion");
  console.log("✅ Task completed cleanly and returned to IDLE");

  // Test 4: Rejection path
  console.log("⚡ Testing rejection flow...");
  const rejectTaskPromise = runner.runTask("Unsafe refactor task");
  
  await new Promise<void>((resolve) => {
    sm.on("stateChange", (state) => {
      if (state === AgentState.WAITING_APPROVAL) resolve();
    });
  });

  await runner.reject("Unsafe deletion detected");
  console.assert(sm.getState() === AgentState.ERROR, "State should be ERROR upon rejection");
  console.log("✅ Rejection correctly stopped task and set state to ERROR without server crash");

  sm.reset();
  console.assert(sm.getState() === AgentState.IDLE, "State should reset to IDLE");
  console.log("✅ Reset successfully restored IDLE state");

  console.log("\n🎉 ALL AGENT STATE MACHINE & HITL TESTS PASSED!\n");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
