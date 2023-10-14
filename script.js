let rankingData = null;
let teamsData = null;

let rankingCount = 20;
const container = document.querySelector(".fetch-results");
const mainTitle = document.querySelector(".main-title");

const removeChildren = (pNode, pCaller) => {
    switch(pCaller) {
        case "ranking":
            while (pNode.children.length !== 5) {
                pNode.removeChild(pNode.lastChild);
            }
            break;
        case "teams":
            while (pNode.children.length !== 0) {
                pNode.removeChild(pNode.lastChild);
            }
            break;
        case "teams-search":
            while (pNode.children.length !== 4) {
                pNode.removeChild(pNode.lastChild);
            }
    }
}

const rankingInit = async () => {
    if (rankingData === null) {
        fetch("https://usm38g8rwj.execute-api.eu-central-1.amazonaws.com/api/global_rankings?number_of_teams=" + rankingCount)
        .then(response => response.json())
        .then(data => {
            rankingData = data;
            console.log(data)
            setRankingContent(rankingData);
        })
    } else {
        setRankingContent(rankingData);
    }
}

const teamsInit = (pEvent) => {
    if (teamsData === null) {
        fetch("https://usm38g8rwj.execute-api.eu-central-1.amazonaws.com/api/teams")
        .then(response => response.json())
        .then(data => {
            teamsData = data;
            teamsData.sort(compare)
            console.log(data)
            setTeamsContent(teamsData);
        })
    } else {
        setTeamsContent(teamsData);
    }
}

const compare = (a, b)  => {
    if ( a.name < b.name ){
        return -1;
    }
    if ( a.name > b.name ){
        return 1;
    }
    return 0;
}

const loadMoreRanking = () => {
    rankingCount += 20;
    fetch("https://usm38g8rwj.execute-api.eu-central-1.amazonaws.com/api/global_rankings?number_of_teams=" + rankingCount)
    .then(response => response.json())
    .then(data => {
        rankingData = data;
        setRankingContent(rankingData);
    })
}

const setRankingContent = (pData) => {
    if (container.children > 1) {
        removeChildren(container, "ranking");
    }
    container.innerHTML = '<div class="header font-bold">Rank</div>' +
    '<div class="header col-span-3 font-bold">Team name</div>' +
    '<div class="header font-bold">Elo</div>' +
    '<div class="header font-bold">Matches</div>' + 
    '<hr class="col-span-6 border-slate-500 mb-3"></hr>';
    mainTitle.textContent = "Ranking predictions";
    pData.forEach(function (team) {
        var rank = document.createElement("div");
        rank.textContent = team.rank;
        rank.classList.add("fetch-data")
        var name = document.createElement("div");
        name.classList.add("col-span-3", "fetch-data", "fetch-data-name");
        name.innerHTML = "<span class='text-xs'>[" + team.league + "]</span> " + team.team_name;
        var elo = document.createElement("div");
        elo.textContent = team.elo;
        elo.classList.add("fetch-data")
        var matches = document.createElement("div");
        matches.textContent = team.matches;
        matches.classList.add("fetch-data")
        var hr = document.createElement("hr");
        hr.classList.add("border-slate-200", "col-span-6");
        
        container.append(rank, name, elo, matches, hr)
    });
    var loadMore = document.createElement("div");
    loadMore.classList.add("underline", "col-span-6", "cursor-pointer", "font-bold", "my-4");
    loadMore.textContent = "Load more";
    loadMore.addEventListener("click", loadMoreRanking);
    container.append(loadMore);
}

const setTeamsContent = (pData) => {
    removeChildren(container, "teams");
    mainTitle.textContent = "Search for a team";
    var filler = document.createElement("div");
    filler.classList.add("col-span-2");
    var input = document.createElement("input");
    input.classList.add("col-span-2", "p-2", "text-center", "rounded-full", "bg-slate-50","text-slate-700");
    input.setAttribute("type", "text");
    input.setAttribute("list", "teams");
    var datalist = document.createElement("datalist");
    datalist.setAttribute("id", "teams");
    pData.forEach(function (team) {
        var option = document.createElement("option");
        option.setAttribute("data", team.team_id);
        option.setAttribute("data-slug", team.slug);
        option.textContent = "[" + team.acronym + "] " + team.name;
        datalist.append(option);
    });

    input.addEventListener("blur", (e) => {
        var searchVal = e.target.value;
        e.target.value = "";
        var datalist = document.querySelector("datalist");
        for (var child in datalist.children) {
            if (searchVal === datalist.children[child].textContent) {
                var teamID = datalist.children[child].getAttribute("data");
                var slug = datalist.children[child].getAttribute("data-slug");
                fetch("https://usm38g8rwj.execute-api.eu-central-1.amazonaws.com/api/team_rankings?team_ids=" + teamID)
                .then(response => response.json())
                .then(data =>  {
                    showSearchResult(data[0], slug);
                })
            }
        }
    });

    input.addEventListener("keypress", (e) => {
        if(e.key === "Enter") {
            input.blur();
        }
    })

    container.append(filler, input, filler.cloneNode(), datalist);
}

const showSearchResult = (pData, pSlug) => {
    console.log(pData);
    removeChildren(container, "teams-search")
    var logoCont = document.createElement("div");
    var logo = document.createElement("img");
    logo.addEventListener("error", function() {
        logo.src = "https://github.com/Xandervdb1/league-front/blob/main/_assets/teams-fallback.png?raw=true"
    });
    logo.src = "https://github.com/lootmarket/esport-team-logos/blob/master/league-of-legends/" + pSlug + "/" + pSlug + "-logo.png?raw=true";
    logoCont.classList.add("col-span-1", "p-2");
    logo.classList.add("team-logo");
    logoCont.append(logo)

    var teamTitleCont = document.createElement("div");
    var teamTitleText = document.createElement("h2");
    teamTitleText.textContent = pData.team_name;
    teamTitleCont.append(teamTitleText);
    teamTitleCont.classList.add("team-title","col-span-5", "mt-5",  "flex", "items-center");
    container.append(logoCont, teamTitleCont)
}

document.querySelectorAll(".nav-link").forEach(function(link) {
    link.addEventListener("click", function(pEvent) {
        document.querySelectorAll(".nav-link").forEach(function(link) {
            link.classList.remove("underline", "underline-offset-4");
        })
        pEvent.target.classList.add("underline", "underline-offset-4");
        if (pEvent.target.classList.contains("leaderboard-init")) {
            rankingInit();
        } else if (pEvent.target.classList.contains("teams-init")) {
            teamsInit();
        }
    })
});

rankingInit();