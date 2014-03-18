import os, csv, ast, subprocess
from dateutil import parser as dateparser

def analyzeRow(d):
    com = d['body'].replace('\n','')
    com = com.replace('\\','')
    cmd = "curl --include --request POST \'https://japerk-text-processing.p.mashape.com/sentiment/\'"
    cmd += " --header \"X-Mashape-Authorization: ********\""
    cmd += " -d \"text="+ com +"\""
    p = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True)
    out, error = p.communicate()
    out = ast.literal_eval(out.split('\r\n\r\n')[1])
    label = classes[out['label']]
    pos = round(out['probability']['pos'],2)
    neg = round(out['probability']['neg'],2)
    ntl = round(out['probability']['neutral'],2)    
    pr_time = dateparser.parse(d['pr_time'])
    com_time = dateparser.parse(d['com_time'])
    # get interval (in minutes) from comment to pull request create time 
    time = (com_time - pr_time).seconds % 60
    
    output = d['merged'] + ',' + d['pr_user_id'] + ',' + d['commenter'] + ',' + d['is_caller']
    output += ',' + str(time) + ',' + label + ',' + str(pos) + ',' + str(neg) + ',' + str(ntl)
    return output
    
classes = {'pos':'1','neg':'2','neutral':'3'}

os.chdir('/Users/eileenlyly/courses/ECS289L/github_data/comments')

proj = 'akka'
reader = csv.DictReader(open(proj+'_pr_comments.csv','rU'))

count = 0
read = 0
with open(proj+'_other.csv','a') as output: 
    while True:        
        try:
            row = reader.next()
            count = count + 1
            if count > 3000:
                break
            if count % 2 == 1: 
                output.write(analyzeRow(row)+'\n')
                read = read + 1
                print str(read) + '/' + str(count)
        except StopIteration:
                print "All Done!"
                break
        except:
            try:
                print "wrong with" + str(count-read) + '/' + str(count)
                print row['body']
            except:
                print "skip one line"
                
        
