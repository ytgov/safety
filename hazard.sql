create table action_status
(
    code        varchar(8)    not null
        primary key,
    name        varchar(256)  not null,
    description varchar(4096) null
);

create table action_type
(
    code        varchar(8)    not null
        primary key,
    name        varchar(256)  not null,
    description varchar(4096) null
);

create table department
(
    code        varchar(8)    not null
        primary key,
    name        varchar(256)  not null,
    description varchar(4096) null
);

create table hazard_status
(
    code        varchar(8)    not null
        primary key,
    name        varchar(256)  not null,
    description varchar(4096) null
);

create table hazard_type
(
    code        int    auto_increment
        primary key,
    name        varchar(256)  not null,
    description varchar(4096) null,
    searchable	boolean not null,
    added_by	int	not null,
    made_searchable_by	int null,
    created_date	datetime null,
    seachable_date	date

);

create table incident_hazard_type
(
    code        varchar(8)    not null
        primary key,
    name        varchar(256)  not null,
    description varchar(4096) null
);

create table incident_status
(
    code        varchar(8)    not null
        primary key,
    name        varchar(256)  not null,
    description varchar(4096) null
);

create table incident_type
(
    code         int    auto_increment
        primary key,
    name        varchar(256)  not null,
    description varchar(4096) null,
    searchable	boolean not null,
    added_by	int	not null,
    made_searchable_by	int null,
    created_date	datetime null,
    seachable_date	date
);

create table location
(
    code        varchar(8)    not null
        primary key,
    name        varchar(256)  not null,
    description varchar(4096) null
);

create table role_type
(
    role_type_id int           not null
        primary key,
    name         varchar(256)  not null,
    permissions  int           not null,
    description  varchar(4096) not null
);

create table role
(
    role_id       int auto_increment
        primary key,
    name          varchar(256) null,
    department          varchar(8)   null,
    location	  varchar(8)   null,
    role_type_id  int          not null,
    emplid         varchar(256)          not null,
    created_date datetime     not null,
    creator       int          not null,
    start_date    datetime     not null,
    end_date      datetime     not null,
    constraint role_department_code_fk
        foreign key (department) references department (code),
    constraint role_location_fk
        foreign key (location) references location (code),
    constraint role_role_type_role_type_id_fk
        foreign key (role_type_id) references role_type (role_type_id)
);

create table role_log
(
    role_log_id       int auto_increment
        primary key,
    role_id       int not null,
    old_name          varchar(256) null,
    old_department          varchar(8)   null,
    old_location	  varchar(8)   null,
    old_role_type_id  int          not null,
    old_emplid        varchar(256)          not null,
    old_start_date    datetime     not null,
    old_end_date      datetime     not null,
    new_name          varchar(256) null,
    new_department          varchar(8)   null,
    new_location	  varchar(8)   null,
    new_role_type_id  int          not null,
    new_emplid        varchar(256)          not null,
    new_start_date    datetime     not null,
    new_end_date      datetime     not null,
    changer_emplid    varchar(256) null,
    changer_role_id   int null,
    changed_date      datetime not null,
    log_comment       varchar(4096) not null,
    user_action       varchar(8) not null,
    constraint role_log_role_role
        foreign key (role_id) references role (role_id),
    constraint role_log_changer_role
        foreign key (changer_role_id) references role (role_id),
    constraint old_role_log_department_code_fk
        foreign key (old_department) references department (code),
    constraint old_role_log_location_fk
        foreign key (old_location) references location (code),
    constraint old_role_log_role_type_role_type_id_fk
        foreign key (old_role_type_id) references role_type (role_type_id),
    constraint new_role_log_department_code_fk
        foreign key (new_department) references department (code),
    constraint new_role_log_location_fk
        foreign key (new_location) references location (code),
    constraint new_role_log_role_type_role_type_id_fk
        foreign key (new_role_type_id) references role_type (role_type_id)
);

create table scope
(
    code        varchar(8)    not null
        primary key,
    name        varchar(256)  not null,
    description varchar(4096) null
);

create table sensitivity
(
    code        varchar(8)    not null
        primary key,
    name        varchar(256)  not null,
    description varchar(4096) null
);

create table hazard
(
    hazard_id       int auto_increment
        primary key,
    hazard_type     INT    not null,
    description     varchar(4096) null,
    location   varchar(8)    null,
    location_detail varchar(8)    null,
    department             varchar(8)    null,
    scope           varchar(8)    null,
    sensitivity     varchar(8)    null,
    created_date   datetime      null,
    status          varchar(8)    null,
    reopen_count    int           not null,
    constraint hazard_hazard_status_code_fk
        foreign key (status) references hazard_status (code),
    constraint hazard_type_code_fk
        foreign key (hazard_type) references hazard_type (code),
    constraint hazard_location_fk
        foreign key (location) references location (code),
    constraint hazard_department_code_fk
        foreign key (department) references department (code),
    constraint hazard_scope_code_fk
        foreign key (scope) references scope (code),
    constraint hazard_sensitivity_code_fk
        foreign key (sensitivity) references sensitivity (code)
);

create table hazard_log
(
    hazard_log_id       int auto_increment
        primary key,
    hazard_id       int not null,
    old_hazard_type     INT    not null,
    old_description     varchar(4096) null,
    old_location   varchar(8)    null,
    old_location_detail varchar(8)    null,
    old_department             varchar(8)    null,
    old_scope           varchar(8)    null,
    old_sensitivity     varchar(8)    null,
    old_status          varchar(8)    null,
    old_reopen_count    int           not null,
    new_hazard_type     INT    not null,
    new_description     varchar(4096) null,
    new_location   varchar(8)    null,
    new_location_detail varchar(8)    null,
    new_department             varchar(8)    null,
    new_scope           varchar(8)    null,
    new_sensitivity     varchar(8)    null,
    new_status          varchar(8)    null,
    new_reopen_count    int           not null,
    changer_emplid    varchar(256) null,
    changer_role_id   int null,
    changed_date      datetime not nUll,
    log_comment       varchar(4096) not null,
    user_action       varchar(8) not null,
    constraint hazard_log_hazard
        foreign key (hazard_id) references hazard (hazard_id),
    constraint hazard_log_changer_role
        foreign key (changer_role_id) references role (role_id),
    constraint hazard_log_hazard_old_status_code_fk
        foreign key (old_status) references hazard_status (code),
    constraint hazard_log_old_type_code_fk
        foreign key (old_hazard_type) references hazard_type (code),
    constraint hazard_log_old_location_fk
        foreign key (old_location) references location (code),
    constraint hazard_log_old_department_code_fk
        foreign key (old_department) references department (code),
    constraint hazard_log_old_scope_code_fk
        foreign key (old_scope) references scope (code),
    constraint hazard_log_old_sensitivity_code_fk
        foreign key (old_sensitivity) references sensitivity (code),
    constraint hazard_log_hazard_new_status_code_fk
        foreign key (new_status) references hazard_status (code),
    constraint hazard_log_new_type_code_fk
        foreign key (new_hazard_type) references hazard_type (code),
    constraint hazard_log_new_location_fk
        foreign key (new_location) references location (code),
    constraint hazard_log_new_department_code_fk
        foreign key (new_department) references department (code),
    constraint hazard_log_new_scope_code_fk
        foreign key (new_scope) references scope (code),
    constraint hazard_log_new_sensitivity_code_fk
        foreign key (new_sensitivity) references sensitivity (code)
);

create table action
(
    action_id         int auto_increment
        primary key,
    hazard_id         int           not null,
    creator_emplId  int           null,
    creator_role_id int           null,
    actor_emplId  int           null,
    actor_role_id int           null,
    created_date       datetime      not null,
    modified_date     datetime      null,
    due_date          datetime      not null,
    description       varchar(4096) not null,
    action_type              varchar(8)    not null,
    sensitivity       varchar(8)    null,
    status            varchar(8)    null,
    constraint action_action_status_code_fk
        foreign key (status) references action_status (code),
    constraint action_action_type_code_fk
        foreign key (action_type) references action_type (code),
    constraint action_hazard_hazard_id_fk
        foreign key (hazard_id) references hazard (hazard_id),
    constraint action_sensitivity_code_fk
        foreign key (sensitivity) references sensitivity (code),
    constraint action_actor_role_role_fk
        foreign key (actor_role_id) references role (role_id),
    constraint action_creator_role_role_fk
        foreign key (creator_role_id) references role (role_id)
);

create table action_log
(
    action_log_id         int auto_increment
        primary key,
    action_id         int,
    hazard_id         int           not null,
    old_actor_emplId  int           null,
    old_actor_role_id int           null,
    old_due_date          datetime      not null,
    old_description       varchar(4096) not null,
    old_action_type              varchar(8)    not null,
    old_sensitivity       varchar(8)    null,
    old_status            varchar(8)    null,
    new_actor_emplId  int           null,
    new_actor_role_id int           null,
    new_due_date          datetime      not null,
    new_description       varchar(4096) not null,
    new_action_type              varchar(8)    not null,
    new_sensitivity       varchar(8)    null,
    new_status            varchar(8)    null,
    changer_emplid    varchar(256) null,
    changer_role_id   int null,
    changed_date      datetime not null,
    log_comment       varchar(4096) not null,
    user_action       varchar(8) not null,
    constraint action_log_action_old_status_code_fk
        foreign key (old_status) references action_status (code),
    constraint action_log_action_old_type_code_fk
        foreign key (old_action_type) references action_type (code),
    constraint action_log_old_sensitivity_code_fk
        foreign key (old_sensitivity) references sensitivity (code),
    constraint action_log_actor_old_role_role_fk
        foreign key (old_actor_role_id) references role (role_id),
    constraint action_log_action_new_status_code_fk
        foreign key (new_status) references action_status (code),
    constraint action_log_action_new_type_code_fk
        foreign key (new_action_type) references action_type (code),
    constraint action_log_new_sensitivity_code_fk
        foreign key (new_sensitivity) references sensitivity (code),
    constraint action_log_actor_new_role_role_fk
        foreign key (new_actor_role_id) references role (role_id),
    constraint action_log_changer_role
        foreign key (changer_role_id) references role (role_id)
);

create table incident
(
    incident_id      int auto_increment
        primary key,
    reporting_person varchar(256)           null,
    proxy_emplid     varchar(256)           null,
    proxi_role_id    int           null,
    description      varchar(4096) not null,
    sensitivity      varchar(8)    NOT null,
    created_date    datetime      not null,
    status           varchar(8)    NOT null,
    department             varchar(8)    NOT null,
    supervisor             varchar(256)    null,
    incident_type             INT    NOT null,
    constraint incident_incident_status_code_fk
        foreign key (status) references incident_status (code),
    constraint incident_incident_status_code_fk2
        foreign key (status) references incident_status (code),
    constraint incident_incident_type_code_fk
        foreign key (incident_type) references incident_type (code),
    constraint incident_sensitivity_code_fk
        foreign key (sensitivity) references sensitivity (code),
    constraint incident_department_code_fk
        foreign key (department) references department (code)
);

create table incident_log
(
    incident_log_id      int auto_increment
        primary key,
    incident_id      int not null,
    old_description      varchar(4096) not null,
    old_sensitivity      varchar(256)    null,
    old_supervisor      varchar(8)    null,
    old_created_date    datetime      not null,
    old_status           varchar(8)    null,
    old_incident_type             INT    null,
    new_description      varchar(4096) not null,
    new_supervisor      varchar(8)    null,
    new_sensitivity      varchar(8)    null,
    new_created_date    datetime      not null,
    new_status           varchar(8)    null,
    new_incident_type             INT    null,
    changer_emplid    varchar(256) null,
    changer_role_id   int null,
    changed_date      datetime not null,
    log_comment       varchar(4096) not null,
    user_action       varchar(8) not null,
    constraint incident_log_incident_fk
        foreign key (incident_id) references incident(incident_id),
    constraint incident_log_old_incident_status_code_fk
        foreign key (old_status) references incident_status (code),
    constraint incident_log_old_status_code_fk2
        foreign key (old_status) references incident_status (code),
    constraint incident_log_old_incident_type_code_fk
        foreign key (old_incident_type) references incident_type (code),
    constraint incident_log_old_sensitivity_code_fk
        foreign key (old_sensitivity) references sensitivity (code),
    constraint incident_log_new_incident_status_code_fk
        foreign key (new_status) references incident_status (code),
    constraint incident_log_new_status_code_fk2
        foreign key (new_status) references incident_status (code),
    constraint incident_log_new_incident_type_code_fk
        foreign key (new_incident_type) references incident_type (code),
    constraint incident_log_new_sensitivity_code_fk
        foreign key (new_sensitivity) references sensitivity (code),
    constraint incident_log_changer_role
        foreign key (changer_role_id) references role (role_id)
);

create table incident_hazard
(
    incident_hazard_id int auto_increment
        primary key,
    incident_id        int        not null,
    hazard_id          int        not null,
    incident_hazard_type          varchar(8) not null,
    priority_order	int NOT NULL,
    constraint incident_hazard_hazard_hazard_id_fk
        foreign key (hazard_id) references hazard (hazard_id),
    constraint incident_hazard_incident_hazard_type_code_fk
        foreign key (incident_hazard_type) references incident_hazard_type (code),
    constraint incident_hazard_incident_incident_id_fk
        foreign key (incident_id) references incident (incident_id)
);

create table incident_hazard_log
(
    incident_hazard_log_id int auto_increment
        primary key,
    incident_hazard_id int not null,
    old_incident_hazard_type          varchar(8) not null,
    new_incident_hazard_type          varchar(8) not null,
    changer_emplid    varchar(256) null,
    changer_role_id   int null,
    changed_date      datetime not null,
    log_comment       varchar(4096) not null,
    user_action       varchar(8) not null,
    constraint incident_hazard_log_incident_hazard_id_fk
        foreign key (incident_hazard_id) references incident_hazard (incident_hazard_id),
    constraint incident_hazard_log_old_incident_hazard_type_code_fk
        foreign key (old_incident_hazard_type) references incident_hazard_type (code),
    constraint incident_hazard_log_new_incident_hazard_type_code_fk
        foreign key (new_incident_hazard_type) references incident_hazard_type (code),
    constraint incident_hazard_log_changer_role
        foreign key (changer_role_id) references role (role_id)
);

alter table hazard_type add
    constraint hazard_type_role_fk
        foreign key (added_by) references role (role_id);

alter table incident_type add
    constraint incident_type_role_fk
        foreign key (added_by) references role (role_id);

create table incident_attachment
(
    incident_attachment_id int auto_increment
        primary key,
    incident_id          int          not null,
    added_by               varchar(256) null,
    thing                  mediumblob   null,
    deleted                tinyint(1)   not null,
    deleted_by             varchar(256) null,
    added_date             datetime     null,
    deleted_date           datetime     null,
    constraint incident_attachment_incident_incident_id_fk
        foreign key (incident_id) references incident_id)
);

create table hazard_attachment
(
    hazard_attachment_id int auto_increment
        primary key,
    hazard_id          int          not null,
    added_by               varchar(256) null,
    thing                  mediumblob   null,
    deleted                tinyint(1)   not null,
    deleted_by             varchar(256) null,
    added_date             datetime     null,
    deleted_date           datetime     null,
    constraint hazard_attachment_hazard_hazard_id_fk
        foreign key (hazard_id) references hazard (hazard_id)
);

create table action_attachment
(
    action_attachment_id int auto_increment
        primary key,
    action_id          int          not null,
    added_by               varchar(256) null,
    thing                  mediumblob   null,
    deleted                tinyint(1)   not null,
    deleted_by             varchar(256) null,
    added_date             datetime     null,
    deleted_date           datetime     null,
    constraint action_attachment_action_action_id_fk
        foreign key (action_id) references action (action_id)
);


