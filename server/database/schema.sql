create table user (
  id int unsigned primary key auto_increment not null,
  pseudo varchar(15) not null unique,
  password varchar(255) not null
);

create table project (
  id int unsigned primary key auto_increment not null,
  title varchar(255) not null,
  user_id int unsigned not null,
  foreign key(user_id) references user(id)
);

CREATE TABLE project_assignment (
    project_id INT UNSIGNED NOT NULL,
    user_id INT UNSIGNED NOT NULL,
    PRIMARY KEY (project_id, user_id),
    FOREIGN KEY (project_id) REFERENCES project(id),
    FOREIGN KEY (user_id) REFERENCES user(id)
);

create table step (
  id int unsigned primary key auto_increment not null,
  name varchar(255) not null,
  type ENUM('To do', 'En cours', 'Bloqué', 'Fini') NOT NULL,
  project_id int unsigned not null,
  foreign key(project_id) references project(id)
);

create table task (
  id int unsigned primary key auto_increment not null,
  Description varchar(255) not null,
  type ENUM('To do', 'En cours', 'Bloqué', 'Fini') NOT NULL,
  step_id int unsigned not null,
  foreign key(step_id) references step(id)
);

CREATE TABLE task_assignment (
    task_id INT UNSIGNED NOT NULL,
    user_id INT UNSIGNED NOT NULL,
    PRIMARY KEY (task_id, user_id),
    FOREIGN KEY (task_id) REFERENCES task(id),
    FOREIGN KEY (user_id) REFERENCES user(id)
);

-- Insertion de 2 utilisateurs
INSERT INTO user (pseudo, password) VALUES
('Alice', '$argon2id$v=19$m=65536,t=3,p=4$OIrIPfI6SRijUE5vNkUppw$JuwlpqGXWpJZh0oMKClUMjPtwD909j+Uu3IChHSQjl8'),
('Bob', '$argon2id$v=19$m=65536,t=3,p=4$OIrIPfI6SRijUE5vNkUppw$JuwlpqGXWpJZh0oMKClUMjPtwD909j+Uu3IChHSQjl8');

-- Récupération des IDs des utilisateurs
SET @alice_id = (SELECT id FROM user WHERE pseudo = 'Alice');
SET @bob_id = (SELECT id FROM user WHERE pseudo = 'Bob');

-- Projets d'Alice
INSERT INTO project (title, user_id) VALUES
('Projet Perso Alice 1', @alice_id),
('Projet Commun', @alice_id);

-- Projets de Bob
INSERT INTO project (title, user_id) VALUES
('Projet Perso Bob 1', @bob_id),
('Projet Commun', @bob_id);

-- Récupération des IDs des projets
SET @projet_alice_1 = (SELECT id FROM project WHERE title = 'Projet Perso Alice 1' AND user_id = @alice_id);
SET @projet_commun_alice = (SELECT id FROM project WHERE title = 'Projet Commun' AND user_id = @alice_id); -- Important : on prend l'ID du Projet Commun créé par Alice.
SET @projet_bob_1 = (SELECT id FROM project WHERE title = 'Projet Perso Bob 1' AND user_id = @bob_id);
SET @projet_commun_bob = (SELECT id FROM project WHERE title = 'Projet Commun' AND user_id = @bob_id);

-- Ajout des participants aux projets (table project_assignment)
-- Alice participe à ses projets
INSERT INTO project_assignment (project_id, user_id) VALUES
(@projet_alice_1, @alice_id),
(@projet_commun_alice, @alice_id);

-- Bob participe à ses projets
INSERT INTO project_assignment (project_id, user_id) VALUES
(@projet_bob_1, @bob_id),
(@projet_commun_bob, @bob_id);

-- Alice et Bob participent au projet commun
INSERT INTO project_assignment (project_id, user_id) VALUES
(@projet_commun_alice, @bob_id),
(@projet_commun_bob, @alice_id);

-- Étapes du Projet Perso Alice 1
INSERT INTO step (name, type, project_id) VALUES
('Étape 1', 'To do', @projet_alice_1),
('Étape 2', 'En cours', @projet_alice_1);

-- Récupération des IDs des étapes du Projet Perso Alice 1
SET @etape_alice_1_1 = (SELECT id FROM step WHERE name = 'Étape 1' AND project_id = @projet_alice_1);
SET @etape_alice_1_2 = (SELECT id FROM step WHERE name = 'Étape 2' AND project_id = @projet_alice_1);

-- Tâches de l'Étape 1 du Projet Perso Alice 1
INSERT INTO task (Description, type, step_id) VALUES
('Tâche 1.1', 'To do', @etape_alice_1_1),
('Tâche 1.2', 'En cours', @etape_alice_1_1);

-- Récupération des IDs des tâches de l'Étape 1 du Projet Perso Alice 1
SET @tache_alice_1_1_1 = (SELECT id FROM task WHERE Description = 'Tâche 1.1' AND step_id = @etape_alice_1_1);
SET @tache_alice_1_1_2 = (SELECT id FROM task WHERE Description = 'Tâche 1.2' AND step_id = @etape_alice_1_1);

-- Assignation des tâches aux utilisateurs (Table task_assignment)
INSERT INTO task_assignment (task_id, user_id) VALUES
(@tache_alice_1_1_1, @alice_id),
(@tache_alice_1_1_2, @alice_id);

-- Étapes du Projet Commun
INSERT INTO step (name, type, project_id) VALUES
('Étape 1', 'To do', @projet_commun_alice),
('Étape 2', 'En cours', @projet_commun_alice);

-- Récupération des IDs des étapes du Projet Commun
SET @etape_commun_1 = (SELECT id FROM step WHERE name = 'Étape 1' AND project_id = @projet_commun_alice);
SET @etape_commun_2 = (SELECT id FROM step WHERE name = 'Étape 2' AND project_id = @projet_commun_alice);

-- Tâches de l'Étape 1 du Projet Commun
INSERT INTO task (Description, type, step_id) VALUES
('Tâche 1.1', 'To do', @etape_commun_1),
('Tâche 1.2', 'En cours', @etape_commun_1);

-- Récupération des IDs des tâches de l'Étape 1 du Projet Commun
SET @tache_commun_1_1 = (SELECT id FROM task WHERE Description = 'Tâche 1.1' AND step_id = @etape_commun_1);
SET @tache_commun_1_2 = (SELECT id FROM task WHERE Description = 'Tâche 1.2' AND step_id = @etape_commun_1);

-- Assignation des tâches aux utilisateurs (Table task_assignment)
INSERT INTO task_assignment (task_id, user_id) VALUES
(@tache_commun_1_1, @alice_id),
(@tache_commun_1_1, @bob_id),
(@tache_commun_1_2, @bob_id);

-- Étapes du Projet Perso Bob 1
INSERT INTO step (name, type, project_id) VALUES
('Étape 1', 'To do', @projet_bob_1),
('Étape 2', 'En cours', @projet_bob_1);

-- Récupération des IDs des étapes du Projet Perso Bob 1
SET @etape_bob_1_1 = (SELECT id FROM step WHERE name = 'Étape 1' AND project_id = @projet_bob_1);
SET @etape_bob_1_2 = (SELECT id FROM step WHERE name = 'Étape 2' AND project_id = @projet_bob_1);

-- Tâches de l'Étape 1 du Projet Perso Bob 1
INSERT INTO task (Description, type, step_id) VALUES
('Tâche 1.1', 'To do', @etape_bob_1_1),
('Tâche 1.2', 'En cours', @etape_bob_1_1);

-- Récupération des IDs des tâches de l'Étape 1 du Projet Perso Bob 1
SET @tache_bob_1_1_1 = (SELECT id FROM task WHERE Description = 'Tâche 1.1' AND step_id = @etape_bob_1_1);
SET @tache_bob_1_1_2 = (SELECT id FROM task WHERE Description = 'Tâche 1.2' AND step_id = @etape_bob_1_1);

-- Assignation des tâches aux utilisateurs (Table task_assignment)
INSERT INTO task_assignment (task_id, user_id) VALUES
(@tache_bob_1_1_1, @bob_id),
(@tache_bob_1_1_2, @bob_id);

-- Afficher les données insérées (Optionnel, pour vérification)
SELECT * FROM user;
SELECT * FROM project;
SELECT * FROM project_assignment;
SELECT * FROM step;
SELECT * FROM task;
SELECT * FROM task_assignment;
