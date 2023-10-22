let rankingData = null;
let teamsData = null;
let tournamentsData = null;
let searchedTeams;

let rankingCount = 20;
const container = document.querySelector(".fetch-results");
const mainTitle = document.querySelector(".main-title");

let teamIDS = [];
let slugs = {};

// Source: https://gist.github.com/mlocati/7210513
function perc2color(percentage, maxHue = 120, minHue = 0) {
    const hue = percentage * (maxHue - minHue) + minHue;
    return `hsl(${hue}, 100%, 50%)`;
}

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
            while (pNode.children.length !== 2) {
                pNode.removeChild(pNode.lastChild);
            }
            break;
        case "tournaments": 
            while (pNode.children.length !== 0) {
                pNode.removeChild(pNode.lastChild);
            }
            break;
        case "tournament-search":
            while (pNode.children.length !== 2) {
                pNode.removeChild(pNode.lastChild);
            }
            break;
    }
}

const rankingInit = async () => {
    if (rankingData === null) {
        fetch("https://usm38g8rwj.execute-api.eu-central-1.amazonaws.com/api/global_rankings?number_of_teams=" + rankingCount)
        .then(response => response.json())
        .then(data => {
            rankingData = data;
            setRankingContent(rankingData);
        })
    } else {
        setRankingContent(rankingData);
    }
}

const teamsInit = (pEvent, deletedTeam = false) => {
    if (teamsData === null) {
        fetch("https://usm38g8rwj.execute-api.eu-central-1.amazonaws.com/api/teams")
        .then(response => response.json())
        .then(data => {
            teamsData = data;
            teamsData.sort(compare)
            setTeamsContent(teamsData, deletedTeam);
        })
    } else {
        setTeamsContent(teamsData, deletedTeam);
    }
}

const tournamentsInit = () => {
    if (tournamentsData === null) {
        fetch("https://usm38g8rwj.execute-api.eu-central-1.amazonaws.com/api/tournaments")
        .then(response => response.json())
        .then(data => {
            tournamentsData = data;
            tournamentsData.sort(compare)
            setTournamentsContent(tournamentsData);
        })
    } else {
        setTournamentsContent(tournamentsData);
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

const setRankingContent = (pData, fromTournament = false) => {
    if (fromTournament === false) {
        if (container.children > 1) {
            removeChildren(container, "ranking");
        }
        container.innerHTML = '<div class="header font-bold">Rank</div>' +
        '<div class="header col-span-3 font-bold">Team name</div>' +
        '<div class="header font-bold">Elo</div>' +
        '<div class="header font-bold">Matches</div>' + 
        '<hr class="col-span-6 border-slate-500 mb-3"></hr>';
        mainTitle.textContent = "Ranking predictions";
    } else {
        removeChildren(container, "tournament-search");
        container.insertAdjacentHTML("beforeend", '<div class="header mt-4 font-bold">Rank</div>' +
        '<div class="header mt-4 col-span-3 font-bold">Team name</div>' +
        '<div class="header mt-4 font-bold">Elo</div>' +
        '<div class="header mt-4 font-bold">Matches</div>' + 
        '<hr class="col-span-6 border-slate-500 mb-3"></hr>');
        mainTitle.textContent = "Tournaments: " + fromTournament;
    }
    pData.forEach(function (team) {
        const rank = document.createElement("div");
        rank.textContent = team.rank;
        rank.classList.add("fetch-data")
        const name = document.createElement("div");
        name.classList.add("col-span-3", "fetch-data", "fetch-data-name");
        if (window.innerWidth > 400) {
            if (team.league !== "UNKNOWN") {
                name.innerHTML = "<span class='text-xs'>[" + team.league + "]</span> " + team.team_name;
            } else {
                name.textContent = team.team_name;
            }
        } else {
            name.textContent = team.team_name;
        }
        const elo = document.createElement("div");
        elo.textContent = team.elo;
        elo.classList.add("fetch-data")
        const matches = document.createElement("div");
        matches.textContent = team.matches;
        matches.classList.add("fetch-data")
        const hr = document.createElement("hr");
        hr.classList.add("border-slate-200", "col-span-6", "my-2");
        
        container.append(rank, name, elo, matches, hr)
    });
    if (fromTournament === false) {
        const loadMore = document.createElement("div");
        loadMore.classList.add("underline", "col-span-6", "cursor-pointer", "font-bold", "my-4");
        loadMore.textContent = "Load more";
        loadMore.addEventListener("click", loadMoreRanking);
        container.append(loadMore);
    }
}

const setTeamsContent = (pData, mustWeDraw) => {
    removeChildren(container, "teams");
    mainTitle.textContent = "Compare teams";
    const inputContainer = document.createElement("div");
    inputContainer.classList.add("mx-20", "col-span-6", "flex", "items-center", "gap-2")
    const input = document.createElement("input");
    input.classList.add( "w-full","p-2", "text-center", "rounded-full", "bg-slate-50","text-slate-700");
    input.setAttribute("type", "text");
    input.setAttribute("list", "teams");
    input.setAttribute("placeholder", "Search for a team...");
    const searchIcon = document.createElement("span");
    searchIcon.classList.add("search-icon");
    searchIcon.innerHTML = '<svg stroke="white" fill="white" stroke-width="0" viewBox="0 0 24 24" height="20px" width="20px" xmlns="http://www.w3.org/2000/svg"><path d="M10,18c1.846,0,3.543-0.635,4.897-1.688l4.396,4.396l1.414-1.414l-4.396-4.396C17.365,13.543,18,11.846,18,10 c0-4.411-3.589-8-8-8s-8,3.589-8,8S5.589,18,10,18z M10,4c3.309,0,6,2.691,6,6s-2.691,6-6,6s-6-2.691-6-6S6.691,4,10,4z"></path></svg>'
    inputContainer.append(input, searchIcon);

    const datalist = document.createElement("datalist");
    datalist.setAttribute("id", "teams");
    pData.forEach(function (team) {
        const option = document.createElement("option");
        option.setAttribute("data", team.team_id);
        option.setAttribute("data-slug", team.slug);
        option.textContent = "[" + team.acronym + "] " + team.name;
        datalist.append(option);
    });

    input.addEventListener("blur", (e) => {
        const searchVal = e.target.value;
        e.target.value = "";
        const datalist = document.querySelector("datalist");
        for (let child in datalist.children) {
            if (searchVal === datalist.children[child].textContent) {
                const teamID = datalist.children[child].getAttribute("data");
                teamIDS.push(teamID);
                const teamIDsString = teamIDS.join(", ")
                const slug = datalist.children[child].getAttribute("data-slug");
                slugs[teamID] = slug;
                fetch("https://usm38g8rwj.execute-api.eu-central-1.amazonaws.com/api/team_rankings?team_ids=" + teamIDsString)
                .then(response => response.json())
                .then(data =>  {
                    showSearchResult(data);
                })
            }
        }
    });

    input.addEventListener("keypress", (e) => {
        if(e.key === "Enter") {
            input.blur();
        }
    });

    container.append( inputContainer, datalist);

    if (mustWeDraw === true && teamIDS.length > 0) {
        const teamIDsString = teamIDS.join(", ")
        fetch("https://usm38g8rwj.execute-api.eu-central-1.amazonaws.com/api/team_rankings?team_ids=" + teamIDsString)
        .then(response => response.json())
        .then(data =>  {
            showSearchResult(data);
        })
    }
}

const showSearchResult = (pData) => {
    searchedTeams = pData;
    let maxElo = -1;
    let minElo;
    let maxMatches = -1;
    let minMatches;
    removeChildren(container, "teams-search");

    pData.forEach(function(team, index) {
        if (minElo === undefined) {
            minElo = team.elo;
        } else if (minElo > team.elo) {
            minElo = team.elo;
        }

        if (minMatches === undefined) {
            minMatches = team.matches;
        } else if (minMatches > team.matches) {
            minMatches = team.matches;
        }

        if (team.elo > maxElo) {
            maxElo = team.elo;
        }
        if (team.matches > maxMatches) {
            maxMatches = team.matches;
        }
        const rankingCont = document.createElement("div");
        rankingCont.classList.add("col-span-1", "text-2xl", "font-bold", "text-right", "flex", "items-center", "justify-end");
        rankingCont.innerHTML = team.rank
    
        const teamTitleCont = document.createElement("div");
        const teamTitleText = document.createElement("h2");
        teamTitleText.classList.add("team-title-text");
        teamTitleText.setAttribute("data-teamid", team.team_id);
        if (window.innerWidth > 400) {
            if (team.league !== "UNKNOWN") {
                teamTitleText.innerHTML = team.team_name + "<span class='text-xs'> " + team.league + "</span>"
            } else {
                teamTitleText.innerHTML = team.team_name;
            }
        } else {
            teamTitleText.innerHTML = team.team_name;
        }
        teamTitleCont.append(teamTitleText);
        teamTitleCont.classList.add("team-title","col-span-4",  "flex", "items-center");
        
        const logoCont = document.createElement("div");
        const logo = document.createElement("img");
        logo.addEventListener("error", function() {
            logo.src = "./_assets/teams-fallback.png"
        });
        logo.src = "https://github.com/lootmarket/esport-team-logos/blob/master/league-of-legends/" + slugs[team.team_id] + "/" + slugs[team.team_id] + "-logo.png?raw=true";
        logoCont.classList.add("col-span-1", "p-2");
        logo.classList.add("team-logo");
        logoCont.append(logo);

        const placeholder = document.createElement("div");
        const placeholderCol1 = placeholder.cloneNode();
        placeholderCol1.classList.add("col-span-1");

        matchesCont = document.createElement("div");
        matchesCont.textContent = "Matches: " + team.matches;
        matchesCont.classList.add("match-cont", "col-span-2");
        matchesCont.setAttribute("data-match", team.matches)

        eloCont = document.createElement("div");
        eloCont.textContent = "Elo: " + team.elo;
        eloCont.classList.add("elo-cont", "col-span-2");
        eloCont.setAttribute("data-elo", team.elo)

        container.append(rankingCont,logoCont, teamTitleCont, placeholderCol1, eloCont, matchesCont, placeholderCol1.cloneNode());
    });

    if(searchedTeams.length !== 1) {
        document.querySelectorAll(".elo-cont").forEach(function(container) {
            let elo = parseInt(container.getAttribute("data-elo"));
            let perc = 0;
            if (elo !== 0 && minElo !== maxElo) {
                perc = ((elo - minElo) / (maxElo - minElo));
            }
    
            container.style.backgroundColor = perc2color(perc);
        })
    
        document.querySelectorAll(".match-cont").forEach(function(container) {
            let match = parseInt(container.getAttribute("data-match"));
            let perc = 0;
            if (match !== 0) {
                perc = ((match - minMatches) / (maxMatches - minMatches));
            }
    
            container.style.backgroundColor = perc2color(perc);
        })
    }

    document.querySelectorAll(".team-title-text").forEach(function(text) {
        text.addEventListener("click", function(pEvent) {
            const teamid = pEvent.target.getAttribute("data-teamid");
            teamIDS = teamIDS.filter(id => id !== teamid);
            teamsInit(pEvent, true);
        })
    })
}

const setTournamentsContent = (pData) => {
    removeChildren(container, "tournaments");
    mainTitle.textContent = "Tournaments";

    const inputContainer = document.createElement("div");
    inputContainer.classList.add("mx-20", "col-span-6", "flex", "items-center", "gap-2")
    const input = document.createElement("input");
    input.classList.add( "w-full","p-2", "text-center", "rounded-full", "bg-slate-50","text-slate-700");
    input.setAttribute("type", "text");
    input.setAttribute("list", "tournaments");
    input.setAttribute("placeholder", "Search for a tournament...");
    const searchIcon = document.createElement("span");
    searchIcon.classList.add("search-icon");
    searchIcon.innerHTML = '<svg stroke="white" fill="white" stroke-width="0" viewBox="0 0 24 24" height="20px" width="20px" xmlns="http://www.w3.org/2000/svg"><path d="M10,18c1.846,0,3.543-0.635,4.897-1.688l4.396,4.396l1.414-1.414l-4.396-4.396C17.365,13.543,18,11.846,18,10 c0-4.411-3.589-8-8-8s-8,3.589-8,8S5.589,18,10,18z M10,4c3.309,0,6,2.691,6,6s-2.691,6-6,6s-6-2.691-6-6S6.691,4,10,4z"></path></svg>'
    inputContainer.append(input, searchIcon);

    const datalist = document.createElement("datalist");
    datalist.setAttribute("id", "tournaments");
    pData.forEach(function (tournament) {
        const option = document.createElement("option");
        option.setAttribute("data", tournament.id);
        option.textContent = tournament.name;
        datalist.append(option);
    });

    input.addEventListener("blur", (e) => {
        const searchVal = e.target.value;
        e.target.value = "";
        const datalist = document.querySelector("datalist");
        for (let child in datalist.children) {
            if (searchVal === datalist.children[child].textContent) {
                const tournamentID = datalist.children[child].getAttribute("data");
                const tournamentName = datalist.children[child].textContent;
                fetch("https://usm38g8rwj.execute-api.eu-central-1.amazonaws.com/api/tournament_rankings/" + tournamentID)
                .then(response => response.json())
                .then(data =>  {
                    showTournament(data, tournamentName);
                })
            }
        }
    });

    input.addEventListener("keypress", (e) => {
        if(e.key === "Enter") {
            input.blur();
        }
    });

    container.append( inputContainer, datalist);
}

const showTournament = (pData, tournamentName) => {
    console.log(pData);
    setRankingContent(pData, tournamentName);
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
        } else if (pEvent.target.classList.contains("tournament-init")) {
            tournamentsInit();
        }
    })
});

rankingInit();