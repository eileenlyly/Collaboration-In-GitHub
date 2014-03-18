create table tmp as (select pull_requests.id as pr_id, user_id as pr_user_id, merged, created_at as pr_time from pull_requests left join pull_request_history 
on pull_requests.id = pull_request_history.pull_request_id where base_repo_id = 107534 and action = "opened");
create table comments as(select tmp.*, comment_id, user_id, body, created_at from tmp inner join pull_request_comments on tmp.pr_id = pull_request_comments.pull_request_id);

alter table comments add column is_caller tinyint(1) default 0;
update comments set is_caller = 1 where pr_user_id = user_id;
select count(*) from comments;
select "preq_id", "pr_user_id", "merged", "pr_time","comment_id", "commenter", "body", "com_time", "is_caller" union all select * from comments into outfile 'scala_pr_comments.csv' 
fields terminated by ',' OPTIONALLY ENCLOSED BY '"' lines terminated by '\n';
drop table comments;
drop table tmp;

