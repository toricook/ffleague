function createMemberCard(member) {
    const card = document.createElement('div');
    card.className = 'member-card';
    
    const nameElement = document.createElement('h2');
    nameElement.textContent = member.name;
    card.appendChild(nameElement);
    
    if (member.currentTeam)
    {
        const teamElement = document.createElement('p');
        teamElement.innerHTML = `<em>${member.currentTeam}</em>`;
        card.appendChild(teamElement);
    }
    
    const historyList = document.createElement('ul');
    member.history.forEach(item => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `<strong>${item.year}</strong>: ${item.team}`;
        historyList.appendChild(listItem);
    });
    card.appendChild(historyList);

    if (member.awards && member.awards.length > 0) {
        const awardsTitle = document.createElement('h3');
        awardsTitle.textContent = 'Awards';
        card.appendChild(awardsTitle);
        
        const awardsList = document.createElement('ul');
        member.awards.forEach(award => {
            const awardItem = document.createElement('li');
            awardItem.textContent = award;
            awardsList.appendChild(awardItem);
        });
        card.appendChild(awardsList);
    }
    
    return card;
}

function loadCurrentMembers() {
    fetch('/../content/members.json')
        .then(response => response.json())
        .then(data => {
            const membersGrid = document.getElementById('members-grid');
            data.forEach(member => {
                const card = createMemberCard(member);
                membersGrid.appendChild(card);
            });
        })
        .catch(error => console.error('Error loading members:', error));
}

function loadPastMembers() {
    fetch('/../content/past_members.json')
        .then(response => response.json())
        .then(data => {
            const membersGrid = document.getElementById('past-members-grid');
            data.forEach(member => {
                const card = createMemberCard(member);
                membersGrid.appendChild(card);
            });
        })
        .catch(error => console.error('Error loading members:', error));
}

// This will allow us to call loadMembers() from the HTML file
window.addEventListener('DOMContentLoaded', loadCurrentMembers);
window.addEventListener('DOMContentLoaded', loadPastMembers);
