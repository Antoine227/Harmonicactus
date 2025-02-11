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