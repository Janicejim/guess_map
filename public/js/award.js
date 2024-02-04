//load navbar
$(function () {
  $("#navbar").load("/navigation.html");
});

async function getAward() {
  let res = await fetch(`/award`);
  let awards = await res.json();
  awardArea.innerHTML = ``;
  for (let award of awards) {
    createAwardDiv(award);
  }
}

getAward();

function createAwardDiv(award) {
  let awardTemplate = document
    .querySelector("#awardTemplate")
    .content.cloneNode(true);
  awardTemplate.querySelector("#image").src = `/${award.image}`;
  awardTemplate.querySelector("#title").textContent = award.name;
  awardTemplate.querySelector("#score").textContent = award.score;
  if (award.quota == 0) {
    awardTemplate.querySelector("#redeem-btn").disabled = true;
    awardTemplate.querySelector("#redeem-btn").textContent = "兌換完畢";
  }

  awardTemplate
    .querySelector("#redeem-btn")
    .addEventListener("click", async () => {
      let res = await fetch(`/award/record?award_id=${award.id}`, {
        method: "POST",
      });
      if (res.ok) {
        let result = await res.json();
        alert(result);
        getAward();
      }
    });

  awardArea.appendChild(awardTemplate);
}
