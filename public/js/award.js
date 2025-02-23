//load navbar
$(function () {
  $("#navbar").load("/navigation.html");
});

async function getAward() {
  let sorting = document.querySelector(".sort-select").value;
  let res = await fetch(`/award?sorting=${sorting}`);
  let result = await res.json();
  if (result.success) {
    let awards = result.data;
    awardArea.innerHTML = ``;
    for (let award of awards) {
      createAwardDiv(award);
    }
  } else {
    Swal.fire("", result.msg, result.success ? "success" : "error");
  }
}

getAward();

function createAwardDiv(award) {
  let awardTemplate = document
    .querySelector("#awardTemplate")
    .content.cloneNode(true);
  awardTemplate.querySelector("#image").src = `https://guessmap.image.bonbony.one/${award.image}`;
  awardTemplate.querySelector("#title").textContent = award.name;
  awardTemplate.querySelector("#score").textContent = award.score;
  if (award.quota == 0) {
    awardTemplate.querySelector("#redeem-btn").disabled = true;
    awardTemplate.querySelector("#redeem-btn").textContent = "兌換完畢";
  }

  awardTemplate
    .querySelector("#redeem-btn")
    .addEventListener("click", async () => {

//check user is login or not:
  let userRes = await fetch(`/user`);

      let userResult = await userRes.json();
if(!userResult.success){
  window.location="/login.html"
  return
}

      let res = await fetch(`/award/record?award_id=${award.id}`, {
        method: "POST",
      });

      let result = await res.json();
      if (result.success) {
        Swal.fire("", result.msg, result.success ? "success" : "error");
        getAward();
      }else{
  Swal.fire("", result.msg, result.success ? "success" : "error");
 }
      
    });

  awardArea.appendChild(awardTemplate);
}

document.querySelector(".sort-select").addEventListener("change", () => {
  getAward();
});
