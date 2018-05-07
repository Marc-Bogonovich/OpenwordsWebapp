package com.openwords.actions.course;

import static com.opensymphony.xwork2.Action.SUCCESS;
import com.openwords.database.Course;
import com.openwords.database.DatabaseHandler;
import com.openwords.interfaces.MyAction;
import com.openwords.utils.MyGson;
import com.openwords.utils.UtilLog;
import org.apache.struts2.convention.annotation.Action;
import org.apache.struts2.convention.annotation.InterceptorRef;
import org.apache.struts2.convention.annotation.ParentPackage;
import org.apache.struts2.convention.annotation.Result;
import org.hibernate.Session;
import org.hibernate.criterion.Restrictions;

@ParentPackage("my-package")
public class SaveCourse extends MyAction {

    private static final long serialVersionUID = 1L;
    private String course, errorMessage;

    @Action(value = "/saveCourse",
            interceptorRefs = @InterceptorRef("myStack"),
            results = {
                @Result(name = SUCCESS, type = "json")
                ,
                @Result(name = LOGIN, location = "error1.json", type = "redirect")
            })
    @Override
    public String execute() throws Exception {
        Session s = DatabaseHandler.getSession();
        try {
            Course c = MyGson.fromJson(course, Course.class);
            UtilLog.logInfo(this, "/saveCourse: " + c.getName());
            if (c.getName().isEmpty()) {
                throw new Exception("Must have a name");
            }

            Course old = (Course) s.createCriteria(Course.class)
                    .add(Restrictions.eq("makeTime", c.getMakeTime()))
                    .add(Restrictions.eq("authorId", getUserId()))
                    .add(Restrictions.eq("userId", 0l))
                    .list().get(0);
            old.setName(c.getName().trim());
            old.setContent(c.getContent());
            old.setUpdated(System.currentTimeMillis());

            s.beginTransaction().commit();
        } catch (Exception e) {
            errorMessage = e.toString();
            UtilLog.logWarn(this, errorMessage);
        } finally {
            s.close();
        }
        return SUCCESS;
    }

    public void setCourse(String course) {
        this.course = course;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    @Override
    public void setErrorMessage(String errorMessage) {
    }
}
